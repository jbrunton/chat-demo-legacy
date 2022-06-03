import { NextApiRequest } from "next";

type Message = { user?: string, msg: string };

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

export default (req: NextApiRequest, res: any) => {
  if (req.method === "POST") {
    const message = req.body;

    if (isCommand(message)) {
      const response = processCommand(message);
      const user = message.user;
      res?.socket?.server?.io.to(user).emit("message", { msg: response });
    } else {
      res?.socket?.server?.io?.emit("message", message);
    }

    res.status(201).send(message);
  }
};