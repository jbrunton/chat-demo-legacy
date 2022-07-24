import { Command, isCommand } from "@domain/entities/commands";
import {
  IncomingMessage,
  isPrivate,
  PublicMessage,
} from "@domain/entities/messages";
import { User } from "@domain/entities/user";
import { processCommand } from "../commands/process-command";
import { Dependencies } from "../dependencies";
import { Dispatcher } from "./dispatcher";

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

export const handleMessage = async (
  message: PublicMessage | Command,
  dispatcher: Dispatcher,
  deps: Dependencies
) => {
  if (isCommand(message)) {
    const response = await processCommand(message)(deps)();
    await deps.roomRepository.saveMessage(response);
    if (isPrivate(response)) {
      dispatcher.sendPrivateMessage(response);
    } else {
      dispatcher.sendPublicMessage(response);
    }
  } else {
    await deps.roomRepository.saveMessage(message);
    dispatcher.sendPublicMessage(message);
  }
};
