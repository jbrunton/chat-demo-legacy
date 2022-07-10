import { adapter, FsAdapter } from "@app/auth/fs-adapter";
import { Command, PublicMessage, User } from "@domain/entities";
import { UserRepository } from "@domain/usecases/commands/rename-user";
import { Adapter } from "next-auth/adapters";
import { processCommand as domainProcessCommand } from "@domain/usecases/commands/process-command";

class FsUserRepository implements UserRepository {
  private readonly adapter: Adapter;

  constructor(adapter: Adapter) {
    this.adapter = adapter;
  }

  async rename(userId: string, newName: string): Promise<User> {
    const updatedUser = await this.adapter.updateUser({
      id: userId,
      name: newName,
    });
    return {
      id: updatedUser.id,
      name: updatedUser.name!,
    };
  }
}

const userRepo = new FsUserRepository(adapter);

export const processCommand = async (
  command: Command
): Promise<PublicMessage> => {
  const message = await domainProcessCommand(command, userRepo);
  return message;
};
