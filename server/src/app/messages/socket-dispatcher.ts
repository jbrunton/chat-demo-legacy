import { Server as IOServer } from "socket.io";
import { Dispatcher } from "@domain/usecases/messages/dispatcher";
import { debug } from "@app/debug";
import {
  isPrivate,
  Message,
  PrivateMessage,
  PublicMessage,
} from "@domain/entities/messages";

export class SocketDispatcher extends IOServer implements Dispatcher {
  sendMessage(message: Message): void {
    if (isPrivate(message)) {
      this.emitPrivateMessage(message);
    } else {
      this.emitPublicMessage(message);
    }
  }

  private emitPrivateMessage(message: PrivateMessage) {
    debug.messages("sending private message: %O", message);
    this.to(message.recipientId).emit("message", message);
  }

  private emitPublicMessage(message: PublicMessage) {
    debug.messages("sending public message: %O", message);
    this.to(message.roomId).emit("message", message);
  }
}
