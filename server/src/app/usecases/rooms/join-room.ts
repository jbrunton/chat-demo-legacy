import { authenticate } from "@app/auth/authenticate";
import { widenDependencies } from "@app/dependencies";
import {
  buildRequestPipeline,
  RequestParser,
  RequestProcessor,
  selectRequest,
} from "@app/utils/api";
import * as usecases from "@domain/usecases/rooms/join-room";
import { JoinRoomParams } from "@domain/usecases/rooms/join-room";
import { sequenceT } from "fp-ts/lib/Apply";
import { flow, pipe } from "fp-ts/lib/function";
import * as RT from "fp-ts/ReaderTask";

const parseRequest: RequestParser<JoinRoomParams> = pipe(
  sequenceT(RT.ApplySeq)(authenticate(), selectRequest("POST")),
  RT.map(([user, req]) => ({ roomId: req.query.id as string, userId: user.id }))
);

const processRequest: RequestProcessor<JoinRoomParams, void> = flow(
  RT.chain((params: JoinRoomParams) =>
    widenDependencies(usecases.joinRoom(params))
  )
);

export const joinRoom = buildRequestPipeline({
  parseRequest,
  processRequest,
});
