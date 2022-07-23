import { NextApiRequest, NextApiResponse } from "next";
import "@app/sockets";
import { debug } from "@app/debug";
import { authOptions } from "./auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { getRoom, roomRepository } from "@app/rooms";
import {
  handleMessage,
  parseMessage,
} from "@domain/usecases/messages/handle-message";
import { CommandEnvironment } from "@domain/usecases/commands/process-command";
import { LowUserRepository } from "src/data/low/user-repository";
import { LowAuthAdapter } from "src/data/low/auth-adapter";
import { AuthDB } from "src/data/low/auth-db";

const authDB = AuthDB.createFileSystemDB();
const userRepository = new LowUserRepository(
  new LowAuthAdapter(authDB),
  authDB
);

const Chat = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    throw new Error("User must be authenticated");
  }

  if (req.method === "POST") {
    if (!res.socket?.server.io) {
      throw new Error("res.socket.server.io was undefined");
    }

    const ioServer = res.socket.server.io;
    const message = parseMessage(req.body, session.user);
    const room = await getRoom(message.roomId);
    if (!room) {
      throw new Error("Unexpected room");
    }
    debug.messages("received message: %O", message);
    const env: CommandEnvironment = {
      userRepository,
      roomRepository,
    };
    await handleMessage(message, ioServer, env);
    res.status(201).send(message);
  }
};

export default Chat;
