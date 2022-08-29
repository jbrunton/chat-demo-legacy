import { Command, isCommand } from "@domain/entities/commands";
import { Message, PublicMessage } from "@domain/entities/messages";
import { flow, pipe } from "fp-ts/lib/function";
import * as RT from "fp-ts/ReaderTask";
import { ReaderTask } from "fp-ts/ReaderTask";
import { ReqDependencies } from "@app/dependencies";
import { processCommand } from "@domain/usecases/commands/process-command";
import { authenticate } from "@app/auth/authenticate";
import { selectRequest, sendResponse } from "@app/utils/api";
import { ParsedMessage, parseMessage } from "./parse-message";
import { sequenceT } from "fp-ts/lib/Apply";
import { getRoom } from "@domain/usecases/rooms/get-room";

export type MessageRequestBody = {
  content: string;
  time: string;
};

export const handleMessage = (): ReaderTask<ReqDependencies, void> => {
  const parseRequest = pipe(
    sequenceT(RT.ApplySeq)(authenticate(), selectRequest("POST")),
    RT.map(parseMessage)
  );

  const processRequest = flow(
    RT.chain(validateRoom),
    RT.chain(processCommands),
    RT.chain(dispatchMessage)
  );

  return pipe(parseRequest, processRequest, RT.chain(sendResponse));
};

const validateRoom = (
  message: PublicMessage | Command
): ReaderTask<ReqDependencies, ParsedMessage> =>
  pipe(getRoom(message.roomId), RT.apSecond(RT.of(message)));

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
