import { Command, User } from "@domain/entities";
import { InvalidArgumentError } from "./InvalidArgumentError";

export interface UserRepository {
  rename(userId: string, newName: string): Promise<User>;
}

export const renameUser = async (
  command: Command,
  repo: UserRepository
): Promise<string> => {
  const newName = command.args.slice(1).join(" ").trim();
  if (newName.length == 0) {
    throw new InvalidArgumentError("Please provide a valid username");
  }
  const updatedUser = await repo.rename(command.sender.id, newName);
  return `${command.sender.name} changed their name to ${updatedUser.name}`;
};
