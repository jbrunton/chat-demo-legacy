import { Socket } from "socket.io-client";
import { Message } from "./messages";

export interface ServerToClientEvents {
  message: (message: Message) => void;
}

export interface ClientToServerEvents {
  message: (message: Message) => void;
}

export type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface InterServerEvents {
  // ping: () => void;
}
