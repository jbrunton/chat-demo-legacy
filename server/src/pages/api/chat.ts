import { NextApiRequest, NextApiResponse } from "next";
import { debug } from "debug";
import "@app/sockets";
import { handleMessage, parseMessage } from "@app/message";

const debugMessages = debug("messages");

const Chat = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    if (!res.socket?.server.io) {
      throw new Error("res.socket.server.io was undefined");
    }

    const ioServer = res.socket.server.io;

    const message = parseMessage(req.body);
    debugMessages("received message:", message);
    handleMessage(message, ioServer);
    res.status(201).send(message);
  }
};

export default Chat;
