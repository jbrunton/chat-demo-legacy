import { EntityNotFoundError } from "@domain/entities/errors";
import { Message } from "@domain/entities/messages";
import { Room } from "@domain/entities/room";
import { ReaderTask } from "fp-ts/ReaderTask";
import { Dependencies } from "../dependencies";

export type GetRoomDependencies = Pick<Dependencies, "roomRepository">;

export const getRoom =
  (roomId: string): ReaderTask<GetRoomDependencies, Room> =>
  ({ roomRepository }) =>
  async () => {
    const room = await roomRepository.getRoom(roomId);
    if (!room) {
      throw EntityNotFoundError.create(roomId, "room");
    }
    return room;
  };

export const getMessageHistory =
  (roomId: string): ReaderTask<GetRoomDependencies, Message[]> =>
  ({ roomRepository }) =>
  async () => {
    return await roomRepository.getMessageHistory(roomId);
  };
