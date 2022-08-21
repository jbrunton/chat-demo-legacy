import { Message } from "@domain/entities/messages";

export interface Dispatcher {
  sendMessage(message: Message): void;
}
