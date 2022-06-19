interface MessageDetails {
  roomId: string;
  time: string;
}

export interface PublicMessage extends MessageDetails {
  senderId?: string;
  content: string;
}

export interface PrivateMessage extends PublicMessage {
  recipientId: string;
}

export interface Command extends MessageDetails {
  senderId: string;
  name: string;
}

export interface ProcessCommand {
  (command: Command): PrivateMessage;
}

export const isCommand = (
  message: PublicMessage | PrivateMessage | Command
): message is Command => {
  return (message as Command).name !== undefined;
};
