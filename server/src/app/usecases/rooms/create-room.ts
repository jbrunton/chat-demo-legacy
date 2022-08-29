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
import * as usecases from "@domain/usecases/rooms/create-room";
import { flow, pipe } from "fp-ts/lib/function";
import * as RT from "fp-ts/ReaderTask";

const parseRequest: RequestParser<User> = pipe(
  authenticate(),
  RT.apFirst(selectRequest("POST"))
);

const processRequest: RequestProcessor<User, Room> = flow(
  RT.chain((user: User) =>
    widenDependencies(usecases.createRoom({ ownerId: user.id }))
  )
);

export const createRoom = buildRequestPipeline({
  parseRequest,
  processRequest,
});
