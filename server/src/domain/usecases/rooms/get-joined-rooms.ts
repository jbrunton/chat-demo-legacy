import { Room } from "@domain/entities/room";
import { ReaderTask } from "fp-ts/lib/ReaderTask";
import { Dependencies } from "../dependencies";

export type GetJoinedRoomsDependencies = Pick<Dependencies, "roomRepository">;

export const getJoinedRooms =
  (userId: string): ReaderTask<GetJoinedRoomsDependencies, Room[]> =>
  ({ roomRepository }) =>
  async () =>
    roomRepository.getJoinedRooms(userId);
