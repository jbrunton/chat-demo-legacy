import { NextApiRequest, NextApiResponse } from "next";
import "types/sockets";
import { generateResponse } from "usecases/messages";

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
      ioServer.emit("message", response);
    }

    res.status(201).send(message);
  }
};

export default Chat;
