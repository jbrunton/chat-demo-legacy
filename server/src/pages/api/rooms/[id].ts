import { NextApiRequest, NextApiResponse } from "next";
import "@app/sockets";
import { authOptions } from "../auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { getRoom } from "@app/rooms";

const Get = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    throw new Error("User must be authenticated");
  }

  if (req.method === "GET") {
    const id = req.query.id as string;
    const room = await getRoom(id);
    if (!room) {
      throw new Error("Could not find room:" + id);
    }
    res.status(201).send(room);
  }
};

export default Get;
