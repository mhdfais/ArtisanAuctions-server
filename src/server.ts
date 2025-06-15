import app from "./app";
import http from "http";
import dotenv from "dotenv";
// import { initSocket } from "./config/scoket";
import { connectDB } from "./config/dbConnect";
import Artwork from "./models/Artwork";
import Bid from "./models/Bid";
import schedule from "node-schedule";
import { Server } from "socket.io";
import { auctionSocket } from "./config/scoket";
import User from "./models/User";
import Seller from "./models/Seller";
import Wallet from "./models/Wallet";
import { generateAndUploadReceipt } from "./utils/recieptService";
import AuctionWon from "./models/AuctionWon";
import Transaction from "./models/Transaction";

dotenv.config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});
auctionSocket(io);
// initSocket(server);

schedule.scheduleJob("* * * * *", async () => {
  const now = new Date();
  const artworks = await Artwork.find({
    isEnded: false,
    auctionEndTime: { $lte: now },
  });

  for (const artwork of artworks) {
    const highestBid = await Bid.findOne({ artworkId: artwork._id }).sort({
      amount: -1,
    });
    await Artwork.updateOne({ _id: artwork._id }, { isEnded: true });

    if (highestBid) {
      await Artwork.updateOne(
        { _id: highestBid.artworkId },
        { winnerId: highestBid.bidderId }
      );

      try {
        const winner = await User.findById(highestBid.bidderId);
        const seller = await Seller.findById(artwork.sellerId);
        const platformCharge = highestBid.amount * 0.1; // ----- 10%
        const amountToSeller = highestBid.amount - platformCharge;

        // ----- find winner wallet and release hold
        const winnerWallet = await Wallet.findOne({ userId: winner?._id });
        if (!winnerWallet || !winnerWallet.holds)
          throw new Error("wallet not found");
        winnerWallet.holds = winnerWallet.holds.filter(
          (hold: { artworkId: any }) => {
            return hold.artworkId.toString() !== artwork._id.toString();
          }
        );

        // ----- deduct money from winners wallet
        winnerWallet.balance -= highestBid.amount;

        // ----- transaction schema for deduct money from winners wallet
        await Transaction.create({
          walletId: winnerWallet._id,
          amount: highestBid.amount,
          type: "transfer",
          status: "completed",
        });

        await winnerWallet.save();

        // ----- credit sellers wallet
        const sellerUser = await User.findOne({ sellerId: artwork.sellerId });
        await Wallet.findOneAndUpdate(
          { userId: sellerUser?._id },
          { $inc: { balance: amountToSeller } }
        );

        // ----- credit transaction ,for seller wallet
        const sellerWallet = await Wallet.findOne({ userId: sellerUser?._id });
        await Transaction.create({
          walletId: sellerWallet?._id,
          amount:amountToSeller,
          type:'deposit',
          status:'completed'
        });

        // ----- generate receipt 
        const receiptUrl = await generateAndUploadReceipt({
          receiptId: `REC-${artwork._id}-${Date.now()}`,
          auctionId: artwork._id.toString(),
          winnerName: winner?.name || "",
          winnerEmail: winner?.email || "",
          sellerName: sellerUser?.name || "",
          sellerEmail: sellerUser?.email || "",
          WinningAmount: highestBid.amount,
          platformFee: platformCharge,
          amountToSeller: amountToSeller,
          artworkTitle: artwork.title,
        });

        await AuctionWon.create({
          artworkId: artwork._id,
          winnerId: winner?._id,
          sellerId: seller?._id,
          bidId: highestBid._id,
          amount: highestBid.amount,
          platformCharge: platformCharge,
          paymentStatus: "pending",
          receiptUrl: receiptUrl,
          amountToSeller: amountToSeller,
        });
        console.log(`auction processed for artwork ${artwork._id}`);
      } catch (error) {
        console.error(`failed to process ${artwork._id}`, error);
      }
    }

    io.of("/auction")
      .to(artwork._id.toString())
      .emit("auctionEnded", {
        artworkId: artwork._id.toString(),
        winner: highestBid
          ? {
              bidderId: highestBid.bidderId,
              bidderName: highestBid.bidderName,
              amount: highestBid.amount,
            }
          : null,
      });
    console.log(`Auction ended for artwork ${artwork._id}`);
  }
});

const PORT = process.env.PORT || 4444;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("database connection failed", err);
  });
