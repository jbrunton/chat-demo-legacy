import { Command, ProcessCommand } from "@domain/entities";
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

interface CommandExecutor {
  match(command: Command): boolean;
  exec(command: Command, userRepo: UserRepository): Promise<CommandResult>;
}

const helpExecutor: CommandExecutor = {
  match(command) {
    return command.name === "help";
  },

  async exec(command, userRepo) {
    return {
      content: helpResponse,
      recipientId: command.sender.id,
    };
  },
};

const renameExecutor: CommandExecutor = {
  match(command) {
    return command.name === "rename" && command.args[0] === "user";
  },

  async exec(command, userRepo) {
    const content = await renameUser(command, userRepo);
    return { content };
  },
};

const executors = [helpExecutor, renameExecutor];

const getResponse = async (
  command: Command,
  userRepo: UserRepository
): Promise<{ content: string; recipientId?: string }> => {
  for (const executor of executors) {
    if (executor.match(command)) {
      return await executor.exec(command, userRepo);
    }
  }

  return {
    content: unrecognisedResponse,
    recipientId: command.sender.id,
  };
};

export const processCommand: ProcessCommand = async (command, userRepo) => {
  const response = await getResponse(command, userRepo);
  return {
    ...response,
    time: command.time,
    roomId: command.roomId,
  };
};
