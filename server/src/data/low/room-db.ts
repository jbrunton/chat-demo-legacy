import { debug } from "@app/debug";
import { Message } from "@domain/entities/messages";
import {
  FindMembershipStatusParams,
  MembershipStatus,
  Room,
} from "@domain/entities/room";
import { chain, ExpChain } from "lodash";
import { JSONFileSync, LowSync, MemorySync, SyncAdapter } from "lowdb";

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

type Data = {
  rooms: Room[];
  memberships: RoomMembership[];
  messages: StoredMessage[];
};

export type UpdateRoomParams = Partial<Omit<Room, "id">> & Pick<Room, "id">;

export class RoomDB extends LowSync<Data> {
  chain: ExpChain<this["data"]> = chain(this).get("data");

  rooms: ExpChain<Data["rooms"]> = this.chain.get("rooms");
  memberships: ExpChain<Data["memberships"]> = this.chain.get("memberships");
  messages: ExpChain<Data["messages"]> = this.chain.get("messages");

  static createFileSystemDB() {
    return new RoomDB(new JSONFileSync("db/rooms.json"));
  }

  static createMemoryDB() {
    return new RoomDB(new MemorySync());
  }

  constructor(adapter: SyncAdapter<Data>) {
    super(adapter);

    this.read();
    if (!this.data) {
      this.data = {
        rooms: [],
        memberships: [],
        messages: [],
      };
      this.write();
    }
  }

  createRoom(room: Room) {
    this.data?.rooms.push(room);
    this.write();
  }

  createMembership(membership: RoomMembership) {
    this.data?.memberships.push(membership);
    this.write();
  }

  createMessage(message: StoredMessage) {
    this.data?.messages.push(message);
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
