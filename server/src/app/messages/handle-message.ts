import { Command, isCommand } from "@domain/entities/commands";
import {
  IncomingMessage,
  isPrivate,
  Message,
  PublicMessage,
} from "@domain/entities/messages";
import { User } from "@domain/entities/user";
import { pipe } from "fp-ts/lib/function";
import * as RT from "fp-ts/ReaderTask";
import { ReqDependencies } from "@app/dependencies";
import { DependencyReaderTask } from "@domain/usecases/dependencies";
import { processCommand } from "@domain/usecases/commands/process-command";

export const parseMessage = (
  incoming: IncomingMessage,
  sender: User
): PublicMessage | Command => {
  const { content, ...details } = incoming;
  if (content.startsWith("/")) {
    const args = content.slice(1).split(" ");
    const commandName = args[0];
    const command: Command = {
      ...details,
      sender,
      name: commandName,
      args: args.slice(1),
    };
    return command;
  }
  const message = {
    ...details,
    sender,
    content,
  };
  return message;
};

export const handleMessage = (
  message: PublicMessage | Command
): DependencyReaderTask<void, ReqDependencies> => {
  if (isCommand(message)) {
    return pipe(processCommand(message), RT.chain(sendMessage));
  } else {
    return sendMessage(message);
  }
};

const sendMessage =
  (response: Message): DependencyReaderTask<void, ReqDependencies> =>
  ({ dispatcher, roomRepository }) =>
  async () => {
    await roomRepository.saveMessage(response);
    if (isPrivate(response)) {
      dispatcher.sendPrivateMessage(response);
    } else {
      dispatcher.sendPublicMessage(response);
    }
  };
