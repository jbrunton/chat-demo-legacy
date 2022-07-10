import { Command, isCommand, PublicMessage, User } from "@domain/entities";
import { processCommand } from "@domain/usecases/commands/process-command";
import { Dispatcher } from "@domain/usecases/messages/dispatcher";

export const parseMessage = (
  incoming: PublicMessage,
  sender: User
): PublicMessage | Command => {
  const { content, ...details } = incoming;
  if (content.startsWith("/")) {
    const commandName = content.slice(1).split(" ")[0];
    const command: Command = {
      ...details,
      sender,
      name: commandName,
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

export const handleMessage = (
  message: PublicMessage | Command,
  dispatcher: Dispatcher
) => {
  if (isCommand(message)) {
    const response = processCommand(message);
    dispatcher.sendPrivateMessage(response);
  } else {
    dispatcher.sendPublicMessage(message);
  }
};
