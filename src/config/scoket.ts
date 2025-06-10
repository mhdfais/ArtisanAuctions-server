
import { Server, Socket } from "socket.io";

export const auctionSocket=(io:Server)=>{
  const nsp=io.of('/auction')  //  ---------------  name space

  nsp.on('connection',(socket:Socket)=>{
    console.log('client connected to /auction')

    socket.on('joinAuction',(artworkId,userId)=>{
      socket.join(artworkId)
      console.log(`user ${userId} joined auction for artwork ${artworkId}`)

      
    }),

    socket.on('disconnect',()=>{
      console.log(`client disconnected from ${socket.id}`)
    })
  })
} 