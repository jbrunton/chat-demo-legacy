import { NextApiRequest, NextApiResponse } from "next";
import "@app/sockets";
import { authOptions } from "../../auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { withDefaultDeps } from "@app/dependencies";
import { getRoomResponse } from "@app/rooms/get-room-response";

const Get = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    throw new Error("User must be authenticated");
  }

  if (req.method === "GET") {
    const id = req.query.id as string;
    const response = await withDefaultDeps().run(getRoomResponse(id));
    res.status(201).send(response);
  }
};

export default Get;
