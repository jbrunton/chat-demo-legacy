import { Socket } from "socket.io-client";
import { Server as IOServer } from "socket.io";
import { Server as NetServer } from "http";
import { SocketDispatcher } from "./dependencies/socket-dispatcher";
import { PublicMessage } from "@domain/entities/messages";

export interface ServerToClientEvents {
  message: (message: PublicMessage) => void;
}

export interface ClientToServerEvents {
  message: (message: PublicMessage) => void;
}

export type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;

export type SocketServer = IOServer<ClientToServerEvents, ServerToClientEvents>;

declare module "net" {
  interface Socket {
    server: NetServer & {
      dispatcher?: SocketDispatcher;
    };
  }
}
