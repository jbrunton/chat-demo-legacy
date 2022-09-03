import { isCommand } from "@domain/entities/commands";
import { Message } from "@domain/entities/messages";
import { flow, pipe } from "fp-ts/lib/function";
import * as RT from "fp-ts/ReaderTask";
import { ReaderTask } from "fp-ts/ReaderTask";
import { ReqDependencies } from "@app/dependencies";
import { processCommand } from "@domain/usecases/commands/process-command";
import { authenticate } from "@app/auth/authenticate";
import { buildRequestPipeline, selectRequest } from "@app/utils/api";
import { ParsedMessage, parseMessage } from "./parse-message";
import { sequenceT } from "fp-ts/lib/Apply";
import { getMembershipStatus, getRoom } from "@domain/usecases/rooms/get-room";
import { MembershipStatus } from "@domain/entities/room";
import { assertNotNil } from "@util/assert";
import { UnauthorisedUser } from "@domain/entities/errors";

export type MessageRequestBody = {
  content: string;
  time: string;
};

const validateRoom = (
  message: ParsedMessage
): ReaderTask<ReqDependencies, ParsedMessage> => {
  const sender = message.sender;
  assertNotNil(sender);

  const roomId = message.roomId;
  const userId = sender.id;

  return pipe(
    getRoom(roomId),
    RT.apSecond(getMembershipStatus({ roomId, userId })),
    RT.map((membershipStatus) => {
      if (membershipStatus !== MembershipStatus.Joined) {
        throw UnauthorisedUser.create(
          userId,
          "send message",
          `room (${roomId})`
        );
      }
      return message;
    })
  );
};

export const processCommands = (
  message: ParsedMessage
): ReaderTask<ReqDependencies, Message> => {
  if (isCommand(message)) {
    return processCommand(message);
  } else {
    return RT.of(message);
  }
};

const dispatchMessage = (
  response: Message
): ReaderTask<ReqDependencies, Message> =>
  pipe(
    RT.ask<ReqDependencies>(),
    RT.chain(({ dispatcher, roomRepository }) =>
      RT.fromTask(async () => {
        await roomRepository.saveMessage(response);
        dispatcher.sendMessage(response);
        return response;
      })
    )
  );

const parseRequest = pipe(
  sequenceT(RT.ApplySeq)(authenticate(), selectRequest("POST")),
  RT.map(parseMessage)
);

const processRequest = flow(
  RT.chain(validateRoom),
  RT.chain(processCommands),
  RT.chain(dispatchMessage)
);

export const handleMessage = buildRequestPipeline({
  parseRequest,
  processRequest,
});
