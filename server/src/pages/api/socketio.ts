import { NextApiRequest, NextApiResponse } from "next";
import { createSocketDispatcher } from "@app/dependencies/socket-dispatcher";

const Handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  createSocketDispatcher(res);
  res.end();
};

export default Handler;
