import app from "./app";
import http from "http";
import dotenv from "dotenv";
// import { initSocket } from "./config/scoket";
import { connectDB } from "./config/dbConnect";

dotenv.config();

const server = http.createServer(app);
// initSocket(server);

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
