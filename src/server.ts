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
