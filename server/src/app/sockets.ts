import { EventDispatcher } from "./dependencies/EventDispatcher";
declare module "net" {
  interface Socket {
    server: Server & {
      dispatcher?: EventDispatcher;
    };
  }
}
