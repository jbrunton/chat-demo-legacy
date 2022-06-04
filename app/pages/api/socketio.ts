import { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";
import { Server as NetServer } from "http";
import "types/net";

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

const Handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  if (!res.socket) {
    throw new Error("res.socket is undefined");
  }

  if (!res.socket.server.io) {
    console.log("Creating Socket.io server...");
    res.socket.server.io = createIOServer(res.socket.server);
  }

  res.end();
};

export default Handler;
