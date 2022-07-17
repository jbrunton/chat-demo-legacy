import { Room } from "@domain/entities";

export type CreateRoomParams = Pick<Room, "name" | "ownerId">;

export interface RoomRepository {
  createRoom(params: CreateRoomParams): Promise<Room>;
  getRoom(id: string): Promise<Room>;
}
