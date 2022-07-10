import { UserRepository } from "./usecases/commands/rename-user";

interface MessageDetails {
  roomId: string;
  time: string;
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

export interface ProcessCommand {
  (command: Command, userRepo: UserRepository): Promise<
    PrivateMessage | PublicMessage
  >;
}

export const isCommand = (
  message: PublicMessage | PrivateMessage | Command
): message is Command => {
  return (message as Command).name !== undefined;
};
