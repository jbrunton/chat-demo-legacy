import { NextApiRequest, NextApiResponse } from "next";
import "@common/sockets";
import { generateResponse } from "@domain/usecases/messages";

const Chat = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const message = req.body;

    if (!res.socket?.server.io) {
      throw new Error("res.socket.server.io was undefined");
    }

    const ioServer = res.socket.server.io;

    const response = generateResponse(message);
    if (response.recipientId) {
      ioServer.to(response.recipientId).emit("message", response);
    } else {
      ioServer.to(response.roomId).emit("message", response);
    }

    res.status(201).send(message);
  }
};

export default Chat;
