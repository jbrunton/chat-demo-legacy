import { debug } from "@app/debug";
import { QuickDbFileAdapter } from "@data/quickdb/adapters/file-adapter";
import { QuickDbMemoryAdapter } from "@data/quickdb/adapters/memory-adapter";
import { QuickDb } from "@data/quickdb/quick-db";
import { QuickDbAdapter, QuickDbStore } from "@data/quickdb/types";
import { Message } from "@domain/entities/messages";
import {
  FindMembershipStatusParams,
  MembershipStatus,
  Room,
} from "@domain/entities/room";
import { ExpChain } from "lodash";

export type StoredMessage = Omit<Message, "sender"> & {
  senderId?: string;
};

type RoomMembership = {
  roomId: string;
  userId: string;
  status: MembershipStatus;
  from: string;
  until?: string;
};

type RoomSchema = {
  rooms: Room;
  memberships: RoomMembership;
  messages: StoredMessage;
};

type RoomStore = QuickDbStore<RoomSchema>;

export type UpdateRoomParams = Partial<Omit<Room, "id">> & Pick<Room, "id">;

export class RoomDB extends QuickDb<RoomSchema> {
  get rooms(): ExpChain<RoomStore["rooms"]> {
    return this.get("rooms");
  }

  get memberships(): ExpChain<RoomStore["memberships"]> {
    return this.get("memberships");
  }

  get messages(): ExpChain<RoomStore["messages"]> {
    return this.get("messages");
  }

  static createFileSystemDB() {
    return new RoomDB(new QuickDbFileAdapter("db/rooms.json"));
  }

  static createMemoryDB() {
    return new RoomDB(new QuickDbMemoryAdapter());
  }

  constructor(adapter: QuickDbAdapter<RoomSchema>) {
    super({
      adapter,
      initStore() {
        return {
          rooms: [],
          memberships: [],
          messages: [],
        };
      },
    });
  }

  createRoom(room: Room) {
    this.rooms.push(room).commit();
    this.write();
  }

  createMembership(membership: RoomMembership) {
    this.memberships.push(membership).commit();
    this.write();
  }

  createMessage(message: StoredMessage) {
    this.messages.push(message).commit();
    this.write();
  }

  updateRoom(params: UpdateRoomParams) {
    this.read();
    const { id } = params;
    const updatedRoom = this.rooms.find({ id }).assign(params).value();
    this.write();
    debug.room(`updateRoom: updated room: %O`, updatedRoom);
    return updatedRoom;
  }

  findMembershipStatus(params: FindMembershipStatusParams) {
    this.read();
    const membership = this.memberships.find((membership) => {
      return (
        membership.roomId === params.roomId &&
        membership.userId === params.userId &&
        !membership.until
      );
    });
    return membership;
  }
}
