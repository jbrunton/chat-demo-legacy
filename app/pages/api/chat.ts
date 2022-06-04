import { NextApiRequest, NextApiResponse } from "next";
import { Message } from "types/messages";
import "types/net";

const helpResponse = `
<p>Type to chat, or enter one of the following commands:</p>
<b>/help</b>: list commands<br />
`;

const unrecognisedResponse = "Unrecognised command, type <b>/help</b> for further assistance";

const isCommand = ({ msg }: Message) => msg.startsWith('/');

const processCommand = ({ msg }: Message) => {
  const cmd = msg.slice(1).split(' ');
  if (cmd[0] === 'help') {
    return helpResponse;
  }
  return unrecognisedResponse;
};

const Chat = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const message = req.body;

    if (!res.socket?.server.io) {
      throw new Error("res.socket.server.io was undefined");
    }

    const ioServer = res.socket.server.io;

    if (isCommand(message)) {
      const response = processCommand(message);
      const userId = message.userId;
      ioServer.to(userId).emit("message", { msg: response });
    } else {
      ioServer.emit("message", message);
    }

    res.status(201).send(message);
  }
};

export default Chat;
