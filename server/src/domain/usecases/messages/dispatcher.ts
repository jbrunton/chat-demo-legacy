import { PrivateMessage, PublicMessage } from "@domain/entities/messages";

export interface Dispatcher {
  sendPublicMessage(message: PublicMessage): void;
  sendPrivateMessage(message: PrivateMessage): void;
}
