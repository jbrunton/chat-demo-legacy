import { Message } from "@domain/entities/messages";
import { Room } from "@domain/entities/room";
import { ReaderTask } from "fp-ts/ReaderTask";
import { Dependencies } from "../dependencies";

export const getRoom =
  (roomId: string): ReaderTask<Dependencies, Room> =>
  ({ roomRepository }) =>
  async () => {
    return await roomRepository.getRoom(roomId);
  };

export const getMessageHistory =
  (roomId: string): ReaderTask<Dependencies, Message[]> =>
  ({ roomRepository }) =>
  async () => {
    return await roomRepository.getMessageHistory(roomId);
  };
