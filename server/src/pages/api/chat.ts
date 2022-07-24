import { NextApiRequest, NextApiResponse } from "next";
import "@app/sockets";
import { debug } from "@app/debug";
import { authOptions } from "./auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import {
  handleMessage,
  parseMessage,
} from "@domain/usecases/messages/handle-message";
import { dependencies } from "@app/dependencies";
import { getRoom } from "@domain/usecases/rooms/get-room";

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
    const room = await getRoom(message.roomId)(dependencies)();
    if (!room) {
      throw new Error("Unexpected room");
    }
    debug.messages("received message: %O", message);
    await handleMessage(message, ioServer, dependencies);
    res.status(201).send(message);
  }
};

export default Chat;
