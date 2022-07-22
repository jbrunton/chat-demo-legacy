export interface IncomingMessage {
  roomId: string;
  content: string;
  time: string;
}

interface PublishedMessage extends IncomingMessage {
  id?: string;
  updated?: ("room" | "user")[];
  transient?: boolean;
}

export interface User {
  id: string;
  name: string;
}

export interface PublicMessage extends PublishedMessage {
  sender?: User;
}

export interface PrivateMessage extends PublicMessage {
  recipientId: string;
}

export type Message = PrivateMessage | PublicMessage;

export const isPrivate = (msg: Message): msg is PrivateMessage => {
  return (msg as PrivateMessage).recipientId !== undefined;
};

export interface Command extends Omit<IncomingMessage, "content"> {
  sender: User;
  name: string;
  args: string[];
}

export interface ProcessCommand<E> {
  (command: Command, env: E): Promise<PrivateMessage | PublicMessage>;
}

export const isCommand = (message: Message | Command): message is Command => {
  return (message as Command).name !== undefined;
};

export interface Room {
  id: string;
  name: string;
  ownerId: string;
}
