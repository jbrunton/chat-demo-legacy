import { adapter } from "@app/auth/fs-adapter";
import { Command, PublicMessage, User } from "@domain/entities";
import { UserRepository } from "@domain/usecases/commands/rename-user";
import { Adapter } from "next-auth/adapters";
import { processCommand as domainProcessCommand } from "@domain/usecases/commands/process-command";
import { FsRoomRepository } from "@app/rooms/fs-room-repository";
import { roomDB } from "@app/rooms";
import { Dispatcher } from "@domain/usecases/messages/dispatcher";

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

const userRepository = new FsUserRepository(adapter);
const roomRepository = new FsRoomRepository(roomDB);

export const processCommand = async (
  command: Command,
  dispatcher: Dispatcher
): Promise<PublicMessage> => {
  const env = {
    dispatcher,
    userRepository,
    roomRepository,
  };
  const message = await domainProcessCommand(command, env);
  return message;
};
