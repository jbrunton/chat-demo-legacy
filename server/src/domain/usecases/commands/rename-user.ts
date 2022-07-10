import { Command, PublicMessage, User } from "@domain/entities";

export interface UserRepository {
  rename(userId: string, newName: string): Promise<User>;
}

export const renameUser = async (
  command: Command,
  repo: UserRepository
): Promise<string> => {
  const newName = command.args.slice(1).join(" ");
  const updatedUser = await repo.rename(command.sender.id, newName);
  return `${command.sender.name} changed their name to ${updatedUser.name}`;
};
