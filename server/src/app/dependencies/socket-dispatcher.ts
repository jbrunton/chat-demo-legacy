import { Server as IOServer, Socket } from "socket.io";
import { Server as NetServer } from "http";
import cookie from "cookie";
import { toUser } from "@data/utils";
import { adapter } from "@app/dependencies/auth-adapter";
import { Dispatcher } from "@domain/usecases/messages/dispatcher";
import { debug } from "@app/debug";
import {
  isPrivate,
  Message,
  PrivateMessage,
  PublicMessage,
} from "@domain/entities/messages";
import { NextApiResponse } from "next";
import { omit } from "lodash";

const authenticate = async (socket: Socket) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  const sessionToken =
    cookies["__Secure-next-auth.session-token"] ||
    cookies["next-auth.session-token"];
  const sessionAndUser = await adapter.getSessionAndUser(sessionToken);
  if (!sessionAndUser) {
    throw new Error("User must be authenticated");
  }
  const { user } = sessionAndUser;
  return toUser(user);
};

export class SocketDispatcher extends IOServer implements Dispatcher {
  constructor(httpServer: NetServer) {
    super(httpServer, {
      path: "/api/socketio",
    });
    this.configureListeners();
  }

  sendMessage(message: Message): void {
    if (isPrivate(message)) {
      this.emitPrivateMessage(message);
    } else {
      this.emitPublicMessage(message);
    }
  }

  private configureListeners() {
    this.on("connection", async (socket) => {
      const user = await authenticate(socket);
      socket.join(user.id);

      const roomId = socket.handshake.query.roomId as string;
      socket.join(roomId);
    });
  }

  private emitPrivateMessage(message: PrivateMessage) {
    logMessage("Sending message (private)", message);
    debug.messages("sending private message: %O", message);
    this.to(message.recipientId).emit("message", message);
  }

  private emitPublicMessage(message: PublicMessage) {
    logMessage("Sending message (public)", message);
    debug.messages("sending public message: %O", message);
    this.to(message.roomId).emit("message", message);
  }
}

export const createSocketDispatcher = (res: NextApiResponse) => {
  if (!res.socket) {
    throw new Error("res.socket is undefined");
  }

  let dispatcher = res.socket.server.dispatcher;

  if (!dispatcher) {
    console.log("Creating Socket.io server...");
    dispatcher = new SocketDispatcher(res.socket.server);
    res.socket.server.dispatcher = dispatcher;
  }

  return dispatcher;
};

const logMessage = (log: string, message: PublicMessage) => {
  const meta = omit(message, ["message", "sender.name"]);
  console.info(`${log}: ${JSON.stringify(meta)}`);
};
