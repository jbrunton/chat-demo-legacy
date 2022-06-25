import { PrivateMessage, PublicMessage } from "@domain/entities";

export interface Dispatcher {
  sendPublicMessage(message: PublicMessage): void;
  sendPrivateMessage(message: PrivateMessage): void;
}
