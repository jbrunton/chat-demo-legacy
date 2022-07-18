import { Room } from "@domain/entities";

export type CreateRoomParams = Pick<Room, "name" | "ownerId">;
export type RenameRoomParams = Pick<Room, "id" | "name">;

export interface RoomRepository {
  createRoom(params: CreateRoomParams): Promise<Room>;
  getRoom(id: string): Promise<Room>;
  renameRoom(params: RenameRoomParams): Promise<Room>;
}
