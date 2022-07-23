import { User } from "@domain/entities";
import { UserRepository } from "@domain/usecases/commands/rename-user";
import { Adapter } from "next-auth/adapters";
import { AuthDB } from "./auth-db";

export class LowUserRepository implements UserRepository {
  private readonly adapter: Adapter;
  private readonly db: AuthDB;

  constructor(adapter: Adapter, db: AuthDB) {
    this.adapter = adapter;
    this.db = db;
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
