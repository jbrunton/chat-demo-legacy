import { adapter } from "@app/auth/fs-adapter";
import { requireDev } from "@app/debug";
import { roomRepository } from "@app/rooms";
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
  const room = await roomRepository.createRoom({ name, ownerId: owner.id });
  res.status(201).send(room);
};

export default CreateRoom;
