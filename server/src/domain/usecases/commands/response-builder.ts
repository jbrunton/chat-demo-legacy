import { Command } from "@domain/entities/commands";
import {
  Message,
  PrivateMessage,
  PublicMessage,
} from "@domain/entities/messages";

export type ResponseBuilderParams = { content: Message["content"] } & Partial<
  Pick<Message, "transient" | "updated">
>;

export const ResponseBuilder = (command: Command) => ({
  publicResponse: (params: ResponseBuilderParams): PublicMessage => ({
    ...params,
    time: command.time,
    roomId: command.roomId,
  }),

  privateResponse: (params: ResponseBuilderParams): PrivateMessage => ({
    ...params,
    time: command.time,
    roomId: command.roomId,
    recipientId: command.sender.id,
  }),
});
