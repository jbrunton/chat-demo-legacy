import { Message } from "./messages";

export interface ServerToClientEvents {
  message: (message: Message) => void;
}

export interface ClientToServerEvents {
  message: (message: Message) => void;
}

export interface InterServerEvents {
  // ping: () => void;
}
