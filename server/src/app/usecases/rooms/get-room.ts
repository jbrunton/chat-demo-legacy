import { authenticate } from "@app/auth/authenticate";
import { ReqDependencies } from "@app/dependencies";
import { RequestAdapter } from "@app/dependencies/requests-adapters";
import { buildRequestPipeline, selectRequest } from "@app/utils/api";
import { Message } from "@domain/entities/messages";
import { Room } from "@domain/entities/room";
import { getMessageHistory, getRoom } from "@domain/usecases/rooms/get-room";
import { flow, pipe } from "fp-ts/function";
import { sequenceT } from "fp-ts/lib/Apply";
import * as RT from "fp-ts/ReaderTask";
import { ReaderTask } from "fp-ts/ReaderTask";

export type RoomResponse = {
  room: Room;
  messages: Message[];
};

const fetchRoomData = (
  id: string
): ReaderTask<ReqDependencies, [Room, Message[]]> =>
  sequenceT(RT.ApplySeq)(getRoom(id), getMessageHistory(id));

const buildRoomResponse = ([room, messages]: [
  Room,
  Message[]
]): RoomResponse => {
  return { room, messages };
};

const parseRoomId = (req: RequestAdapter): string => {
  return req.query["id"] as string;
};

const parseRequest = pipe(
  authenticate(),
  RT.apSecond(selectRequest("GET")),
  RT.map(parseRoomId)
);

const processRequest = flow(RT.chain(fetchRoomData), RT.map(buildRoomResponse));

export const getRoomResponse = buildRequestPipeline({
  parseRequest,
  processRequest,
});
