import { IncomingMessage, Message, Room } from "@domain/entities";

export type CreateRoomParams = Pick<Room, "name" | "ownerId">;
export type RenameRoomParams = Pick<Room, "id" | "name">;

export interface RoomRepository {
  createRoom(params: CreateRoomParams): Promise<Room>;
  getRoom(id: string): Promise<Room>;
  renameRoom(params: RenameRoomParams): Promise<Room>;
  saveMessage(message: IncomingMessage): Promise<Message>;
  getMessageHistory(roomId: string): Promise<Message[]>;
}
