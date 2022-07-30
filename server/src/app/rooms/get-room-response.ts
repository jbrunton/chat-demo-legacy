import { Message } from "@domain/entities/messages";
import { Room } from "@domain/entities/room";
import { DependencyReaderTask } from "@domain/usecases/dependencies";
import { getMessageHistory, getRoom } from "@domain/usecases/rooms/get-room";
import { pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";

export type RoomResponse = {
  room: Room;
  messages: Message[];
};

export const getRoomResponse = (
  id: string
): DependencyReaderTask<RoomResponse> => {
  return pipe(
    getRoom(id),
    RT.chain((room) =>
      pipe(
        getMessageHistory(id),
        RT.map((messages) => ({ room, messages }))
      )
    )
  );
};
