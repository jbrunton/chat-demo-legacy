import { User } from "./user";

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
