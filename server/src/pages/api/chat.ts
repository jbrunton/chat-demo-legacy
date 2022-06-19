import { NextApiRequest, NextApiResponse } from "next";
import "@app/sockets";
import { isCommand } from "@domain/entities";
import { processCommand } from "@domain/usecases/commands/process-command";
import { ClientMessage, parseMessage } from "@app/message";

const Chat = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const message = parseMessage(req.body);

    if (!res.socket?.server.io) {
      throw new Error("res.socket.server.io was undefined");
    }

    const ioServer = res.socket.server.io;

    if (isCommand(message)) {
      const response = processCommand(message);
      ioServer
        .to(response.recipientId)
        .emit("message", { ...response, user: req.body.user });
    } else {
      const response: ClientMessage = { ...message, user: req.body.user };
      ioServer.to(message.roomId).emit("message", response);
    }

    res.status(201).send(message);
  }
};

export default Chat;
