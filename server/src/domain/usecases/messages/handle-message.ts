import {
  Command,
  IncomingMessage,
  isCommand,
  isPrivate,
  PublicMessage,
  User,
} from "@domain/entities";
import {
  CommandEnvironment,
  processCommand,
} from "../commands/process-command";
import { Dispatcher } from "./dispatcher";

export const parseMessage = (
  incoming: IncomingMessage,
  sender: User
): PublicMessage | Command => {
  const { content, ...details } = incoming;
  if (content.startsWith("/")) {
    const args = content.slice(1).split(" ");
    const commandName = args[0];
    const command: Command = {
      ...details,
      sender,
      name: commandName,
      args: args.slice(1),
    };
    return command;
  }
  const message = {
    ...details,
    sender,
    content,
  };
  return message;
};

export const handleMessage = async (
  message: PublicMessage | Command,
  dispatcher: Dispatcher,
  env: CommandEnvironment
) => {
  if (isCommand(message)) {
    const response = await processCommand(message, env);
    await env.roomRepository.saveMessage(response);
    if (isPrivate(response)) {
      dispatcher.sendPrivateMessage(response);
    } else {
      dispatcher.sendPublicMessage(response);
    }
  } else {
    await env.roomRepository.saveMessage(message);
    dispatcher.sendPublicMessage(message);
  }
};
