import { NextApiRequest, NextApiResponse } from "next";
import "@app/sockets";
import { withReqDeps } from "@app/dependencies";
import { handleMessage } from "@app/messages/handle-message";

const Chat = async (req: NextApiRequest, res: NextApiResponse) => {
  await withReqDeps(req, res).run(handleMessage());
};

export default Chat;
