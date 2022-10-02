import { NextSessionRepository } from "@app/dependencies/session-repository";
import { Message } from "@domain/entities/messages";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId, roomId } = await parseRequest(req, res);

  if (!userId) {
    res.status(401).send({ error: "Authentication required" });
    return;
  }

  sendEvents(res, { userId, roomId });
};

type SubscribeRequestParams = {
  userId?: string;
  roomId: string;
};

const parseRequest = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<SubscribeRequestParams> => {
  const nextSessionRepo = NextSessionRepository(req, res);
  const session = await nextSessionRepo.getSession();
  const roomId = req.query.id as string;
  const userId = session?.user.id as string;
  return { roomId, userId };
};

const sendEvents = (
  res: NextApiResponse,
  requestParams: Required<SubscribeRequestParams>
) => {
  writeHeaders(res);
  writeMessages(res, requestParams);
};

const writeHeaders = (res: NextApiResponse) => {
  res.writeHead(200, {
    Connection: "keep-alive",
    "Content-Encoding": "none",
    "Cache-Control": "no-cache, no-transform",
    "Content-Type": "text/event-stream;charset=utf-8",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();

  // Firefox doesn't seem to consider the connection open until the stream is written to
  res.write("\n");
};

const writeMessages = (
  res: NextApiResponse,
  requestParams: Required<SubscribeRequestParams>
) => {
  const onMessage = (message: Message) => {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  };

  const dispatcher = res.socket?.server.dispatcher;

  dispatcher?.subscribe(requestParams, onMessage);

  res.on("close", () => {
    dispatcher?.unsubscribe(requestParams, onMessage);
    res.end("done\n");
  });
};

export default handler;
