import { Socket } from "socket.io-client";
import { Server as IOServer } from "socket.io";
import { Server as NetServer } from "http";
import { ClientMessage } from "./message";

export interface ServerToClientEvents {
  message: (message: ClientMessage) => void;
}

export interface ClientToServerEvents {
  message: (message: ClientMessage) => void;
}

export type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;

export type SocketServer = IOServer<ClientToServerEvents, ServerToClientEvents>;

declare module "net" {
  interface Socket {
    server: NetServer & {
      io?: SocketServer;
    };
  }
}
