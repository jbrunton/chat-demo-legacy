import { debug } from "@app/debug";
import { Message } from "@domain/entities/messages";
import { Room } from "@domain/entities/room";
import { chain, ExpChain } from "lodash";
import { JSONFileSync, LowSync, MemorySync, SyncAdapter } from "lowdb";

export type StoredMessage = Omit<Message, "sender"> & {
  senderId?: string;
};

type Data = {
  rooms: Room[];
  messages: StoredMessage[];
};

export type UpdateRoomParams = Partial<Omit<Room, "id">> & Pick<Room, "id">;

export class RoomDB extends LowSync<Data> {
  chain: ExpChain<this["data"]> = chain(this).get("data");

  rooms: ExpChain<Data["rooms"]> = this.chain.get("rooms");
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
        messages: [],
      };
      this.write();
    }
  }

  createRoom(room: Room) {
    this.data?.rooms.push(room);
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
}
