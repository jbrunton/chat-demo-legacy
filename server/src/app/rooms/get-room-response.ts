import { authenticate } from "@app/auth/authenticate";
import { ReqDependencies } from "@app/dependencies";
import { RequestAdapter } from "@app/dependencies/requests-adapters";
import { selectRequest, sendResponse } from "@app/utils/api";
import { Message } from "@domain/entities/messages";
import { Room } from "@domain/entities/room";
import { DependencyReaderTask } from "@domain/usecases/dependencies";
import { getMessageHistory, getRoom } from "@domain/usecases/rooms/get-room";
import { pipe } from "fp-ts/function";
import { sequenceT } from "fp-ts/lib/Apply";
import * as RT from "fp-ts/ReaderTask";

export type RoomResponse = {
  room: Room;
  messages: Message[];
};

export const getRoomResponse = (): DependencyReaderTask<
  void,
  ReqDependencies
> => {
  return pipe(
    authenticate(),
    RT.apSecond(selectRequest("GET")),
    RT.map(parseRoomId),
    RT.chain(fetchRoomData),
    RT.map(buildRoomResponse),
    RT.chain(sendResponse)
  );
};

const fetchRoomData = (
  id: string
): DependencyReaderTask<[Room, Message[]], ReqDependencies> =>
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