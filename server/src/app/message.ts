import {
  Command,
  isCommand,
  isPrivate,
  PublicMessage,
  User,
} from "@domain/entities";
import { Dispatcher } from "@domain/usecases/messages/dispatcher";
import { processCommand } from "./commands/process-command";

export const parseMessage = (
  incoming: PublicMessage,
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
  const message: PublicMessage = {
    ...details,
    sender,
    content,
  };
  return message;
};

export const handleMessage = async (
  message: PublicMessage | Command,
  dispatcher: Dispatcher
) => {
  if (isCommand(message)) {
    const response = await processCommand(message, dispatcher);
    if (isPrivate(response)) {
      dispatcher.sendPrivateMessage(response);
    } else {
      dispatcher.sendPublicMessage(response);
    }
  } else {
    dispatcher.sendPublicMessage(message);
  }
};
