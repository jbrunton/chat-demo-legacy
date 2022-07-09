import { adapter } from "@app/auth/fs-adapter";
import { requireDev } from "@app/debug";
import { NextApiRequest, NextApiResponse } from "next";

type RequestBody = {
  name: string;
  email: string;
};

const Session = async (req: NextApiRequest, res: NextApiResponse) => {
  requireDev();

  const { name, email } = req.body || (req.query as RequestBody);
  let user = await adapter.getUserByEmail(email);
  if (!user) {
    user = await adapter.createUser({ name, email });
  }
  res.status(201).send(user);
};

export default Session;
