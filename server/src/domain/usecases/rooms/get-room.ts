import { EntityNotFoundError } from "@domain/entities/errors";
import { Message } from "@domain/entities/messages";
import { Room } from "@domain/entities/room";
import { DependencyReaderTask } from "../dependencies";

// TODO: can this be refactored with RT.of and ask()
export const getRoom =
  (roomId: string): DependencyReaderTask<Room> =>
  ({ roomRepository }) =>
  async () => {
    const room = await roomRepository.getRoom(roomId);
    if (!room) {
      throw EntityNotFoundError.create(roomId, "room");
    }
    return room;
  };

export const getMessageHistory =
  (roomId: string): DependencyReaderTask<Message[]> =>
  ({ roomRepository }) =>
  async () => {
    return await roomRepository.getMessageHistory(roomId);
  };
