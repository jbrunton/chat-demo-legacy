import { Server as IOServer } from "socket.io";
import { PrivateMessage, PublicMessage } from "@domain/entities";
import { Dispatcher } from "@domain/usecases/messages/dispatcher";
import { debug } from "@app/debug";

export class SocketDispatcher extends IOServer implements Dispatcher {
  sendPublicMessage(message: PublicMessage): void {
    debug.messages("sending public message:", message);
    this.to(message.roomId).emit("message", message);
  }

  sendPrivateMessage(message: PrivateMessage): void {
    debug.messages("sending private message:", message);
    this.to(message.recipientId).emit("message", message);
  }
}
