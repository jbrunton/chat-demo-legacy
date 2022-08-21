import { debug } from "@app/debug";
import { RequestAdapter } from "@app/dependencies/requests-adapters";
import { Command } from "@domain/entities/commands";
import { PublicMessage } from "@domain/entities/messages";
import { User } from "@domain/entities/user";
import { MessageRequestBody } from "./handle-message";

export type ParsedMessage = PublicMessage | Command;

export const parseMessage = ([sender, req]: [
  User,
  RequestAdapter
]): ParsedMessage => {
  const roomId = req.query["id"] as string;
  const body: MessageRequestBody = req.body;
  const { content, ...details } = body;

  if (content.startsWith("/")) {
    const args = content.slice(1).split(" ");
    const commandName = args[0];
    const command: Command = {
      ...details,
      roomId,
      sender,
      name: commandName,
      args: args.slice(1),
    };

    debug.messages("received command: %O", command);
    return command;
  }

  const message = {
    ...details,
    roomId,
    sender,
    content,
  };

  debug.messages("received message: %O", message);
  return message;
};
