import { NextApiRequest, NextApiResponse } from "next";
import "@app/sockets";
import { handleMessage, parseMessage } from "@app/message";
import { debug } from "@app/debug";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

const Chat = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession({ req, res }, authOptions);
  if (!session) {
    throw new Error("User must be authenticated");
  }

  if (req.method === "POST") {
    if (!res.socket?.server.io) {
      throw new Error("res.socket.server.io was undefined");
    }

    const ioServer = res.socket.server.io;
    const message = parseMessage(req.body, session.user);
    debug.messages("received message: %O", message);
    await handleMessage(message, ioServer);
    res.status(201).send(message);
  }
};

export default Chat;
