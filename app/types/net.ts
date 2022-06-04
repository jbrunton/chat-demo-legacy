import { Server as IOServer } from "socket.io";
import { Server as NetServer } from "http";

declare module "net" {
  interface Socket {
      server: NetServer & {
        io?: IOServer;
      };
  }
}
