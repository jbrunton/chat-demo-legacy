import { NextApiRequest, NextApiResponse } from "next";
import "@app/sockets";
import { Command, isCommand, PublicMessage } from "@domain/entities";
import { processCommand } from "@domain/usecases/commands/process-command";
import { AppMessage } from "src/app/message";

interface IncomingMessage {
  user: string;
  senderId: string;
  roomId: string;
  content: string;
  time: string;
}

const parseMessage = (incoming: IncomingMessage): PublicMessage | Command => {
  const { senderId, roomId, content, time } = incoming;
  if (content.startsWith("/")) {
    const commandName = content.slice(1).split(" ")[0];
    const command: Command = {
      name: commandName,
      senderId,
      roomId,
      time,
    };
    return command;
  }
  const message: PublicMessage = {
    senderId,
    roomId,
    time,
    content,
  };
  return message;
};

const Chat = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const message = parseMessage(req.body);

    if (!res.socket?.server.io) {
      throw new Error("res.socket.server.io was undefined");
    }

    const ioServer = res.socket.server.io;

    if (isCommand(message)) {
      const response = processCommand(message);
      ioServer.to(response.recipientId).emit("message", response);
    } else {
      const response: AppMessage = { ...message, user: req.body.user };
      ioServer.to(message.roomId).emit("message", response);
    }

    res.status(201).send(message);
  }
};

export default Chat;
