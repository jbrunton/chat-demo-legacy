import { adapter } from "@app/auth/fs-adapter";
import { requireDev } from "@app/debug";
import { addDays } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";

type RequestBody = {
  sessionToken: string;
  email: string;
};

const Session = async (req: NextApiRequest, res: NextApiResponse) => {
  requireDev();

  const { sessionToken, email } = req.body || (req.query as RequestBody);
  const user = await adapter.getUserByEmail(email);
  if (!user) {
    throw new Error(`Cound not find user with email ${email}`);
  }
  const session = await adapter.createSession({
    sessionToken,
    userId: user?.id,
    expires: addDays(new Date(), 30),
  });
  res.status(201).send(session);
};

export default Session;
