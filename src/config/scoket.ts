import { Server as httpServer } from "http";
import { Server } from "socket.io";

let io:Server;

export const initSocket = (server: httpServer) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "PATCH"],
    },
  });

  io.on('connection',(socket)=>{
    console.log('socket connected:', socket.id)
  })
};

export const getIO=()=>{
    if(!io) throw new Error ('socket not initialized')
        return io
}