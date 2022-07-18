interface MessageDetails {
  roomId: string;
  time: string;
  updated?: ("room" | "user")[];
}

export interface User {
  id: string;
  name: string;
}

export interface PublicMessage extends MessageDetails {
  sender?: User;
  content: string;
}

export interface PrivateMessage extends PublicMessage {
  recipientId: string;
}

export const isPrivate = (
  msg: PublicMessage | PrivateMessage
): msg is PrivateMessage => {
  return (msg as PrivateMessage).recipientId !== undefined;
};

export interface Command extends MessageDetails {
  sender: User;
  name: string;
  args: string[];
}

export interface ProcessCommand<E> {
  (command: Command, env: E): Promise<PrivateMessage | PublicMessage>;
}

export const isCommand = (
  message: PublicMessage | PrivateMessage | Command
): message is Command => {
  return (message as Command).name !== undefined;
};

export interface Room {
  id: string;
  name: string;
  ownerId: string;
}
