import { Room } from "@domain/entities/room";
import { DependencyReaderTask } from "../dependencies";

export type CreateRoomParams = {
  ownerId: string;
  name?: string;
};

export const createRoom =
  ({ ownerId, name }: CreateRoomParams): DependencyReaderTask<Room> =>
  ({ roomRepository, nameGenerator }) =>
  async () => {
    return await roomRepository.createRoom({
      name: name || nameGenerator.getPlaceName(),
      ownerId,
    });
  };
