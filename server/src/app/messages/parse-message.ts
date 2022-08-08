import { debug } from "@app/debug";
import { RequestAdapter } from "@app/dependencies/requests-adapters";
import { Command } from "@domain/entities/commands";
import { PublicMessage } from "@domain/entities/messages";
import { assertNotNil } from "@util/assert";
import { MessageRequestBody } from "./handle-message";

export const parseMessage = (req: RequestAdapter): PublicMessage | Command => {
  const roomId = req.query["id"] as string;
  const body: MessageRequestBody = req.body;
  const { content, ...details } = body;

  const sender = req.user;
  assertNotNil(sender);

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
