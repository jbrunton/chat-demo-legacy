import { Server as IOServer } from "socket.io";
import { Dispatcher } from "@domain/usecases/messages/dispatcher";
import { debug } from "@app/debug";
import { PrivateMessage, PublicMessage } from "@domain/entities/messages";

export class SocketDispatcher extends IOServer implements Dispatcher {
  sendPublicMessage(message: PublicMessage): void {
    debug.messages("sending public message: %O", message);
    this.to(message.roomId).emit("message", message);
  }

  sendPrivateMessage(message: PrivateMessage): void {
    debug.messages("sending private message: %O", message);
    this.to(message.recipientId).emit("message", message);
  }
}
