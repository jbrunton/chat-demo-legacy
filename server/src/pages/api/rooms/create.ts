import { NextApiRequest, NextApiResponse } from "next";
import "@app/sockets";
import { authOptions } from "../auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { createRoom } from "@domain/usecases/rooms/create-room";
import { withDefaultDeps } from "@app/dependencies";

const Create = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    throw new Error("User must be authenticated");
  }

  if (req.method === "POST") {
    const ownerId = session.user.id;
    const room = await withDefaultDeps().run(createRoom({ ownerId }));
    res.status(201).send(room);
  }
};

export default Create;
