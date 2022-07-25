import { Message, PublicMessage } from "./messages";

export interface Room {
  id: string;
  name: string;
  ownerId: string;
}

export type CreateRoomParams = Pick<Room, "name" | "ownerId">;
export type RenameRoomParams = Pick<Room, "id" | "name">;

export interface RoomRepository {
  createRoom(params: CreateRoomParams): Promise<Room>;
  getRoom(id: string): Promise<Room | null>;
  renameRoom(params: RenameRoomParams): Promise<Room>;
  saveMessage(message: PublicMessage): Promise<Message>;
  getMessageHistory(roomId: string): Promise<Message[]>;
}
