import { authenticate } from "@app/auth/authenticate";
import { widenDependencies } from "@app/dependencies";
import {
  buildRequestPipeline,
  RequestParser,
  RequestProcessor,
  selectRequest,
} from "@app/utils/api";
import { Room } from "@domain/entities/room";
import { User } from "@domain/entities/user";
import { getJoinedRooms } from "@domain/usecases/rooms/get-joined-rooms";
import { flow, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";

export type JoinedRoomsResponse = {
  rooms: Room[];
};

const parseRequest: RequestParser<User> = pipe(
  selectRequest("GET"),
  RT.apSecond(authenticate())
);

const processRequest: RequestProcessor<User, JoinedRoomsResponse> = flow(
  RT.chain((user) => widenDependencies(getJoinedRooms(user.id))),
  RT.map((rooms) => ({ rooms }))
);

export const getJoinedRoomsResponse = buildRequestPipeline({
  parseRequest,
  processRequest,
});
