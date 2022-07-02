import { Server as IOServer } from "socket.io";
import { debug } from "debug";
import { PrivateMessage, PublicMessage } from "@domain/entities";
import { Dispatcher } from "@domain/usecases/messages/dispatcher";

const debugMessages = debug("messages");
export class SocketDispatcher extends IOServer implements Dispatcher {
  sendPublicMessage(message: PublicMessage): void {
    debugMessages("sending public message:", message);
    this.to(message.roomId).emit("message", message);
  }

  sendPrivateMessage(message: PrivateMessage): void {
    debugMessages("sending private message:", message);
    this.to(message.recipientId).emit("message", message);
  }
}
