import { NextApiRequest, NextApiResponse } from "next";
import { Server as NetServer } from "http";
import { SocketDispatcher } from "@app/socket-dispatcher";
import { greetUser } from "@domain/usecases/messages/greet-user";
import cookie from "cookie";
import { adapter } from "@app/auth/fs-adapter";
import { Socket } from "socket.io";
import { toUser } from "./auth/utils";

export const config = {
  api: {
    bodyParser: false,
  },
};

const authenticate = async (socket: Socket) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  const sessionToken =
    cookies["next-auth.session-token"] ||
    cookies["__Secure-next-auth.session-token"];
  const sessionAndUser = await adapter.getSessionAndUser(sessionToken);
  if (!sessionAndUser) {
    throw new Error("User must be authenticated");
  }
  const { user } = sessionAndUser;
  return toUser(user);
};

const createIOServer = (httpServer: NetServer) => {
  const io: SocketDispatcher = new SocketDispatcher(httpServer, {
    path: "/api/socketio",
  });
  io.on("connection", async (socket) => {
    const user = await authenticate(socket);
    socket.join(user.id);

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
