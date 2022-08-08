import { requireDev } from "@app/debug";
import { withDefaultDeps } from "@app/dependencies";
import { adapter } from "@app/dependencies/auth-adapter";
import { createRoom } from "@domain/usecases/rooms/create-room";
import { NextApiRequest, NextApiResponse } from "next";

type RequestBody = {
  name: string;
  ownerEmail: string;
};

const CreateRoom = async (req: NextApiRequest, res: NextApiResponse) => {
  requireDev();

  const { name, ownerEmail } = req.body || (req.query as RequestBody);
  const owner = await adapter.getUserByEmail(ownerEmail);
  if (!owner) {
    throw new Error("Could not find owner");
  }
  const room = await withDefaultDeps().run(
    createRoom({ ownerId: owner.id, name })
  );
  res.status(201).send(room);
};

export default CreateRoom;
