import { PublicMessage, User } from "@domain/entities";

export type ConnectedEvent = {
  user: User;
  roomId: string;
};

export const greetUser = (event: ConnectedEvent): PublicMessage => {
  const { user, roomId } = event;
  const message: PublicMessage = {
    content: `${user.name} joined the chat. Welcome, ${user.name}!`,
    time: new Date().toISOString(),
    roomId,
  };
  return message;
};
