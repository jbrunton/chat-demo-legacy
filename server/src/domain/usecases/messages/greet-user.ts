import { PublicMessage } from "@domain/entities";
import { Dispatcher } from "./dispatcher";

export type ConnectedEvent = {
  user: string;
  roomId: string;
};

export const greetUser = (event: ConnectedEvent): PublicMessage => {
  const { user, roomId } = event;
  const message: PublicMessage = {
    content: `${user} joined the chat. Welcome, ${user}!`,
    time: new Date().toISOString(),
    roomId,
  };
  return message;
};
