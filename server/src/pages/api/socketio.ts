import { NextApiRequest, NextApiResponse } from "next";
import { Server as NetServer } from "http";
import { SocketDispatcher } from "@app/socket-dispatcher";
import { greetUser } from "@domain/usecases/messages/greet-user";

export const config = {
  api: {
    bodyParser: false,
  },
};

const createIOServer = (httpServer: NetServer) => {
  const io: SocketDispatcher = new SocketDispatcher(httpServer, {
    path: "/api/socketio",
  });
  io.on("connection", (socket) => {
    const user = socket.handshake.query.user as string;
    const roomId = socket.handshake.query.roomId as string;
    socket.join(roomId);
    const message = greetUser({ user, roomId });
    io.sendPublicMessage(message);
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
