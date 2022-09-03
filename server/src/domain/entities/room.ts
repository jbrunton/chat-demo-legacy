import { Message, PublicMessage } from "./messages";

export interface Room {
  id: string;
  name: string;
  ownerId: string;
}

export enum MembershipStatus {
  None = "None",
  Joined = "Joined",
  PendingApproval = "PendingApproval",
  Revoked = "Revoked",
}

export type CreateRoomParams = Pick<Room, "name" | "ownerId">;
export type RenameRoomParams = Pick<Room, "id" | "name">;
export type FindMembershipStatusParams = { roomId: string; userId: string };

export interface RoomRepository {
  createRoom(params: CreateRoomParams): Promise<Room>;
  getRoom(id: string): Promise<Room | null>;
  renameRoom(params: RenameRoomParams): Promise<Room>;
  saveMessage(message: PublicMessage): Promise<Message>;
  getMessageHistory(roomId: string): Promise<Message[]>;
  setMembershipStatus(
    params: FindMembershipStatusParams,
    status: MembershipStatus
  ): Promise<void>;
  getMembershipStatus(
    params: FindMembershipStatusParams
  ): Promise<MembershipStatus>;
  getJoinedRooms(userId: string): Promise<Room[]>;
}
