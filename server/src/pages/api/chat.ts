import { NextApiRequest, NextApiResponse } from "next";
import "@app/sockets";
import { debug } from "@app/debug";
import { authOptions } from "./auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { withReqDeps } from "@app/dependencies";
import { getRoom } from "@domain/usecases/rooms/get-room";
import { handleMessage, parseMessage } from "@app/messages/handle-message";

const Chat = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    throw new Error("User must be authenticated");
  }

  if (req.method === "POST") {
    const message = parseMessage(req.body, session.user);
    const room = await withReqDeps(res).run(getRoom(message.roomId));
    if (!room) {
      throw new Error("Unexpected room");
    }
    debug.messages("received message: %O", message);
    await withReqDeps(res).run(handleMessage(message));
    res.status(201).send(message);
  }
};

export default Chat;
