import { Command, PublicMessage } from "@domain/entities";

export interface ClientMessage extends PublicMessage {
  user: string;
}

export interface IncomingMessage extends ClientMessage {
  senderId: string;
}

export const parseMessage = (
  incoming: IncomingMessage
): PublicMessage | Command => {
  const { content, user, ...details } = incoming;
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
