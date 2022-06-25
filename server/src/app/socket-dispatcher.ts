import { Server as IOServer } from "socket.io";
import { PrivateMessage, PublicMessage } from "@domain/entities";
import { Dispatcher } from "@domain/usecases/messages/dispatcher";

export class SocketDispatcher extends IOServer implements Dispatcher {
  sendPublicMessage(message: PublicMessage): void {
    this.to(message.roomId).emit("message", message);
  }

  sendPrivateMessage(message: PrivateMessage): void {
    this.to(message.recipientId).emit("message", message);
  }
}
