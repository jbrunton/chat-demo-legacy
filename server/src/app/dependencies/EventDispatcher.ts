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
import EventEmitter from "events";

type MessageListener = (message: Message) => void;

type SubscribeUserParams = {
  userId: string;
  roomId: string;
};

export class EventDispatcher implements Dispatcher {
  private readonly emitter = new EventEmitter();

  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
  }

  public subscribe(params: SubscribeUserParams, listener: MessageListener) {
    this.emitter.on(publicEventName(params), listener);
    this.emitter.on(privateEventName(params), listener);
  }

  public unsubscribe(params: SubscribeUserParams, listener: MessageListener) {
    this.emitter.off(publicEventName(params), listener);
    this.emitter.off(privateEventName(params), listener);
  }

  sendMessage(message: Message): void {
    if (isPrivate(message)) {
      this.emitPrivateMessage(message);
    } else {
      this.emitPublicMessage(message);
    }
  }

  private emitPrivateMessage(message: PrivateMessage) {
    logMessage("Sending message (private)", message);
    debug.messages("sending private message: %O", message);

    const eventName = privateEventName({
      roomId: message.roomId,
      userId: message.recipientId,
    });
    this.emitter.emit(eventName, message);
  }

  private emitPublicMessage(message: PublicMessage) {
    logMessage("Sending message (public)", message);
    debug.messages("sending public message: %O", message);

    const eventName = publicEventName(message);
    this.emitter.emit(eventName, message);
  }
}

export const createSocketDispatcher = (res: NextApiResponse) => {
  if (!res.socket) {
    throw new Error("res.socket is undefined");
  }

  let dispatcher = res.socket.server.dispatcher;

  if (!dispatcher) {
    dispatcher = new EventDispatcher(new EventEmitter());
    res.socket.server.dispatcher = dispatcher;
  }

  return dispatcher;
};

const logMessage = (log: string, message: PublicMessage) => {
  const meta = omit(message, ["content", "sender.name"]);
  console.info(`${log}: ${JSON.stringify(meta)}`);
};

const publicEventName = ({ roomId }: Pick<SubscribeUserParams, "roomId">) =>
  `/rooms/${roomId}`;
const privateEventName = ({ roomId, userId }: SubscribeUserParams) =>
  `/rooms/${roomId}/private/${userId}`;
