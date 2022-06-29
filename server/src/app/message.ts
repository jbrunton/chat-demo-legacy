import { Command, isCommand, PublicMessage, User } from "@domain/entities";
import { processCommand } from "@domain/usecases/commands/process-command";
import { Dispatcher } from "@domain/usecases/messages/dispatcher";

export interface IncomingMessage extends PublicMessage {
  sender: User;
}

export const parseMessage = (
  incoming: IncomingMessage
): PublicMessage | Command => {
  const { content, ...details } = incoming;
  if (content.startsWith("/")) {
    const commandName = content.slice(1).split(" ")[0];
    const command: Command = {
      ...details,
      name: commandName,
    };
    return command;
  }
  const message: PublicMessage = {
    ...details,
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
