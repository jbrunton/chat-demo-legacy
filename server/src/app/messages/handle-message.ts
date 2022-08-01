import { Command, isCommand } from "@domain/entities/commands";
import { isPrivate, Message, PublicMessage } from "@domain/entities/messages";
import { pipe } from "fp-ts/lib/function";
import * as RT from "fp-ts/ReaderTask";
import { ReqDependencies } from "@app/dependencies";
import { DependencyReaderTask } from "@domain/usecases/dependencies";
import { processCommand } from "@domain/usecases/commands/process-command";
import { authenticate } from "@app/auth/authenticate";
import { selectRequest, sendResponse } from "@app/utils/api";
import { parseMessage } from "./parse-message";

export type MessageRequestBody = {
  content: string;
  time: string;
};

export const handleMessage = (): DependencyReaderTask<
  void,
  ReqDependencies
> => {
  return pipe(
    authenticate(),
    RT.chain(() => selectRequest("POST")),
    RT.map(parseMessage),
    RT.chain(validateRoom),
    RT.chain(processCommands),
    RT.chain(processResponse),
    RT.chain(sendResponse)
  );
};

const validateRoom = (
  message: PublicMessage | Command
): DependencyReaderTask<PublicMessage | Command, ReqDependencies> =>
  pipe(
    RT.ask<ReqDependencies>(),
    RT.chain(({ roomRepository }) =>
      RT.fromTask(async () => {
        const room = await roomRepository.getRoom(message.roomId);
        if (!room) {
          throw new Error(`Unexpected roomId: ${message.roomId}`);
        }
        return message;
      })
    )
  );

export const processCommands = (
  message: PublicMessage | Command
): DependencyReaderTask<Message, ReqDependencies> => {
  if (isCommand(message)) {
    return processCommand(message);
  } else {
    return RT.of(message);
  }
};

const processResponse = (
  response: Message
): DependencyReaderTask<Message, ReqDependencies> =>
  pipe(
    RT.ask<ReqDependencies>(),
    RT.chain(({ dispatcher, roomRepository }) =>
      RT.fromTask(async () => {
        await roomRepository.saveMessage(response);
        if (isPrivate(response)) {
          dispatcher.sendPrivateMessage(response);
        } else {
          dispatcher.sendPublicMessage(response);
        }
        return response;
      })
    )
  );
