import { User } from "@domain/entities";
import { UserRepository } from "@domain/usecases/commands/rename-user";
import { Adapter } from "next-auth/adapters";
import { adapter } from "./fs-adapter";

export class FsUserRepository implements UserRepository {
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

export const userRepository = new FsUserRepository(adapter);
