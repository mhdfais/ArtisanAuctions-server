import { Server, Socket } from "socket.io";
import { verifyAccessToken } from "../utils/generateToken";
import Artwork from "../models/Artwork";
import User from "../models/User";
import Bid from "../models/Bid";
import { parseCookies } from "../utils/parseCookie";
import Wallet from "../models/Wallet";
import jwt from "jsonwebtoken";

export const auctionSocket = (io: Server) => {
  const nsp = io.of("/auction"); //  ---------------  name space

  nsp.on("connection", (socket: Socket) => {
    console.log("client connected to /auction");

    const cookie = socket.handshake.headers.cookie;
    let token;
    if (cookie) {
      const cookies = parseCookies(cookie);
      token = cookies["access_token"];
    }
    // console.log(token,'------------------');
    if (!token) {
      socket.emit("error", { message: "Token not found" });
      socket.disconnect();
      return;
    }

    let user;
    try {
      user = verifyAccessToken(token);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        socket.emit("error", { message: "Token expired", code: "TOKEN_EXPIRED" });
      } else {
        socket.emit("error", { message: "Authentication failed" });
        socket.disconnect();
      }
      return;
    }

    socket.on("joinAuction", async ({ artworkId, email }) => {
      if (email !== user.email) {
        console.log(email,user.email)
        socket.emit("error", { message: "unauthorized user" });
        return;
      }
      try {
        const artwork = await Artwork.findById(artworkId);
        if (!artwork) {
          socket.emit("error", { message: "artwork not found" });
          return;
        }

        // console.log('heeeeeeeeeeeeeeeeeeeeeeee')
        // if (artwork.isEnded || new Date() > new Date(artwork.auctionEndTime!)) {
        //   socket.emit("error", { success: "auction has ended" });
        //   return;
        // }

        const userDetail = await User.findOne({ email: user.email });
        if (!userDetail) {
          socket.emit("error", { message: "user not found" });
          return;
        }

        // const isUserArtwork = userDetail.listings?.some(
        //   (listingId) => listingId.toString() === artworkId.toString()
        // );
        // if (isUserArtwork) {
        //   socket.emit("error", { message: "you cannot join your own auction" });
        //   return;
        // }
        socket.join(artworkId);
        console.log(`user ${email} joined auction for artwork ${artworkId}`);
      } catch (error) {
        socket.emit("error", { message: "server error" });
      }
    }),
      socket.on(
        "placeBid",
        async ({ artworkId, email, bidAmount }, callback) => {
          if (email != user.email) {
            callback({ success: false, error: "unauthorized user" });
            return;
          }

          try {
            const artwork = await Artwork.findById(artworkId);
            if (!artwork) {
              callback({ success: false, error: "artwork not found" });
              return;
            }

            if (
              artwork.isEnded ||
              new Date() > new Date(artwork.auctionEndTime!)
            ) {
              callback({ success: false, error: "auction has ended" });
              return;
            }

            const userDetail = await User.findOne({ email: user.email });
            if (!userDetail) {
              callback({ success: false, error: "user not found" });
              return;
            }

            const wallet = await Wallet.findOne({ userId: userDetail._id });
            if (!wallet) {
              callback({ succcess: false, error: "wallet not found" });
              return;
            }

            const isUserArtwork = userDetail.listings?.some(
              (listingId) => listingId.toString() === artworkId.toString()
            );
            if (isUserArtwork) {
              callback({
                success: false,
                error: "you cannot bif for your own auction",
              });
              return;
            }

            const minBid = artwork.highestBid
              ? artwork.highestBid + 50
              : artwork.reservePrice;
            if (bidAmount < minBid!) {
              callback({
                success: false,
                error: `bid must be at least ₹${minBid}`,
              });
              return;
            }

            // ----- clear any previous hold for current bidder (in case rebidding)
            await Wallet.updateOne(
              { userId: userDetail._id },
              { $pull: { holds: { artworkId } } }
            );

            // Re-fetch updated wallet
            const updatedWallet = await Wallet.findOne({
              userId: userDetail._id,
            });
            if (!updatedWallet) {
              callback({ success: false, error: "wallet not found" });
              return;
            }

            // ----- check available balance
            const totalHolds: number = (updatedWallet.holds ?? []).reduce(
              (sum, hold) => sum + Number(hold.amount ?? 0),
              0
            );
            const availableBalance: number =
              Number(updatedWallet.balance ?? 0) - totalHolds;
            if (bidAmount > availableBalance) {
              callback({ success: false, error: "insufficient funds" });
              return;
            }

            // ----- finding previous highest bid identify outbid user
            const previousBid = await Bid.findOne({ artworkId })
              .sort({ amount: -1 })
              .select("bidderId amount");
            let previousBidderId = null;
            // console.log(previousBid,'---------------------------------')
            // console.log(userDetail)
            if (
              previousBid &&
              previousBid.bidderId &&
              previousBid.bidderId.toString() !== userDetail._id.toString()
            ) {
              previousBidderId = previousBid.bidderId;
            }

            const bid = new Bid({
              artworkId,
              bidderId: userDetail._id,
              bidderName: userDetail.name,
              placedAt: new Date(),
              amount: bidAmount,
            });

            if (previousBidderId) {
              await Wallet.updateOne(
                { userId: previousBidderId, "holds.artworkId": artworkId },
                { $pull: { holds: { artworkId } } }
              );
            }

            // ----- add hold for current bid
            await Wallet.updateOne(
              { userId: userDetail._id },
              { $push: { holds: { artworkId, amount: bidAmount } } }
            );

            // ----- save new bid
            await bid.save();

            // ----- update artwork highestbid
            artwork.highestBid = bidAmount;
            // artwork.highestBidderId=new Types(userDetail._id)
            await artwork.save();

            socket.to(artworkId).emit("newBid", {
              artworkId,
              bidderId: userDetail._id.toString(),
              bidderName: userDetail.name,
              bidAmount,
              timestamp: bid.placedAt.toISOString(),
            });
            callback({ success: true });

            // await Artwork.updateOne(
            //   { _id: artworkId },
            //   { highestBid: bidAmount }
            // );

            // const bidEvent = {
            //   artworkId,
            //   bidderId: userDetail._id.toString(),
            //   bidderName: userDetail.name,
            //   bidAmount,
            //   timestamp: bid.placedAt.toISOString(),
            // };

            // nsp.to(artworkId).emit("newBid", bidEvent);
          } catch (error) {
            console.error("error placing bid", error);
            callback({ success: false, error: "server error" });
          }
        }
      ),
      socket.on("disconnect", () => {
        console.log(`client disconnected from ${socket.id}`);
      });
  });
};
