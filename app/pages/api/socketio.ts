import { NextApiRequest } from "next";
import { Server as IOServer } from "socket.io";
import { Server as NetServer } from "http";

export const config = {
  api: {
    bodyParser: false,
  },
};

const createIOServer = (httpServer: NetServer) => {
  const io = new IOServer(httpServer, {
    path: "/api/socketio",
  });
  io.on("connection", (socket) => {
    const user = socket.handshake.query.user as string;  
    io.emit("message", { msg: `${user} joined the chat. Welcome, ${user}!`});  
  });
  return io;
};

export default async (req: NextApiRequest, res: any) => {
  if (!res.socket.server.io) {
    console.log("Creating Socket.io server...");
    const httpServer: NetServer = res.socket.server as any;
    const ioServer = createIOServer(httpServer);
    res.socket.server.io = ioServer;
  }
  res.end();
};
