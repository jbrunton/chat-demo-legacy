import { Command, ProcessCommand, PublicMessage } from "@domain/entities";
import { RoomRepository } from "../rooms/repository";
import { InvalidArgumentError } from "./InvalidArgumentError";
import { renameRoom } from "./rename-room";
import { renameUser, UserRepository } from "./rename-user";

const helpResponse = `
<p>Type to chat, or enter one of the following commands:</p>
<b>/help</b>: list commands<br />
<b>/rename user &lt;name&gt;</b>: change your display name<br />
`;

const unrecognisedResponse =
  "Unrecognised command, type <b>/help</b> for further assistance";

interface CommandResult {
  content: string;
  recipientId?: string;
}

export interface CommandEnvironment {
  userRepository: UserRepository;
  roomRepository: RoomRepository;
}

interface CommandExecutor {
  match(command: Command): boolean;
  exec(command: Command, env: CommandEnvironment): Promise<CommandResult>;
}

const helpExecutor: CommandExecutor = {
  match(command) {
    return command.name === "help";
  },

  async exec(command, _env) {
    return {
      content: helpResponse,
      recipientId: command.sender.id,
    };
  },
};

const renameUserExecutor: CommandExecutor = {
  match(command) {
    return command.name === "rename" && command.args[0] === "user";
  },

  async exec(command, env) {
    const content = await renameUser(command, env.userRepository);
    return { content, updated: ["user"] };
  },
};

const renameRoomExecutor: CommandExecutor = {
  match(command) {
    return command.name === "rename" && command.args[0] === "room";
  },

  async exec(command, env) {
    const content = await renameRoom(command, env.roomRepository);
    return { content, updated: ["room"] };
  },
};

const executors = [helpExecutor, renameUserExecutor, renameRoomExecutor];

type ResponseResult = Pick<PublicMessage, "content" | "updated"> & {
  recipientId?: string;
};

const getResponse = async (
  command: Command,
  env: CommandEnvironment
): Promise<ResponseResult> => {
  for (const executor of executors) {
    if (executor.match(command)) {
      try {
        return await executor.exec(command, env);
      } catch (e: any) {
        if (e instanceof InvalidArgumentError) {
          const content = e.message;
          return {
            content,
            recipientId: command.sender.id,
          };
        }
        throw e;
      }
    }
  }

  return {
    content: unrecognisedResponse,
    recipientId: command.sender.id,
  };
};

export const processCommand: ProcessCommand<CommandEnvironment> = async (
  command,
  env
) => {
  const response = await getResponse(command, env);
  return {
    ...response,
    time: command.time,
    roomId: command.roomId,
  };
};
