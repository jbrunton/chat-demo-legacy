import { Room } from "@domain/entities/room";
import { ReaderTask } from "fp-ts/lib/ReaderTask";
import { Dependencies } from "../dependencies";

export type CreateRoomParams = {
  ownerId: string;
  name?: string;
};

export const createRoom =
  ({ ownerId, name }: CreateRoomParams): ReaderTask<Dependencies, Room> =>
  ({ roomRepository, nameGenerator }) =>
  async () => {
    return await roomRepository.createRoom({
      ownerId,
      name: name || nameGenerator.getPlaceName(),
    });
  };
