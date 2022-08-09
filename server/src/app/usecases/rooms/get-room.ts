import { authenticate } from "@app/auth/authenticate";
import { ReqDependencies } from "@app/dependencies";
import { RequestAdapter } from "@app/dependencies/requests-adapters";
import { buildRequestPipeline, selectRequest } from "@app/utils/api";
import { Message } from "@domain/entities/messages";
import {
  FindMembershipStatusParams,
  MembershipStatus,
  Room,
} from "@domain/entities/room";
import { User } from "@domain/entities/user";
import {
  getMembershipStatus,
  getMessageHistory,
  getRoom,
} from "@domain/usecases/rooms/get-room";
import { flow, pipe } from "fp-ts/function";
import { sequenceT } from "fp-ts/lib/Apply";
import * as RT from "fp-ts/ReaderTask";
import { ReaderTask } from "fp-ts/ReaderTask";

export type RoomResponse = {
  room: Room;
  messages: Message[];
  membershipStatus: MembershipStatus;
};

const fetchRoomData = ({
  userId,
  roomId,
}: FindMembershipStatusParams): ReaderTask<
  ReqDependencies,
  [Room, Message[], MembershipStatus]
> =>
  sequenceT(RT.ApplySeq)(
    getRoom(roomId),
    getMessageHistory(roomId),
    getMembershipStatus({
      roomId,
      userId,
    })
  );

const buildRoomResponse = ([room, messages, membershipStatus]: [
  Room,
  Message[],
  MembershipStatus
]): RoomResponse => {
  return { room, messages, membershipStatus };
};

const parseRoomId = ([user, req]: [
  User,
  RequestAdapter
]): FindMembershipStatusParams => {
  const roomId = req.query["id"] as string;
  return {
    roomId,
    userId: user.id,
  };
};

const parseRequest = pipe(
  sequenceT(RT.ApplySeq)(authenticate(), selectRequest("GET")),
  RT.map(parseRoomId)
);

const processRequest = flow(RT.chain(fetchRoomData), RT.map(buildRoomResponse));

export const getRoomResponse = buildRequestPipeline({
  parseRequest,
  processRequest,
});
