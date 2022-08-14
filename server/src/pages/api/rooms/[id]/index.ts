import { NextApiRequest, NextApiResponse } from "next";
import "@app/sockets";
import { withReqDeps } from "@app/dependencies";
import { getRoomResponse } from "@app/rooms/get-room-response";

const Get = async (req: NextApiRequest, res: NextApiResponse) => {
  await withReqDeps(req, res).run(getRoomResponse());
};

export default Get;
