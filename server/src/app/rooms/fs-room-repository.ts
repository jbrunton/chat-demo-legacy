import { debug } from "@app/debug";
import { IncomingMessage, isPrivate, Message, Room } from "@domain/entities";
import {
  CreateRoomParams,
  RenameRoomParams,
  RoomRepository,
} from "@domain/usecases/rooms/repository";
import { chain, ExpChain } from "lodash";
import { LowSync } from "lowdb";
import crypto from "crypto";

export type Data = {
  rooms: Room[];
  messages: Message[];
};

export class FsRoomDB extends LowSync<Data> {
  chain: ExpChain<this["data"]> = chain(this).get("data");

  rooms: ExpChain<Data["rooms"]> = this.chain.get("rooms");
  messages: ExpChain<Data["messages"]> = this.chain.get("messages");

  createRoom(room: Room) {
    this.data?.rooms.push(room);
    this.write();
  }

  createMessage(message: Message) {
    this.data?.messages.push(message);
    this.write();
  }

  updateRoom(room: Partial<Omit<Room, "id">> & Pick<Room, "id">) {
    this.read();
    const { id } = room;
    const updatedRoom = this.rooms.find({ id }).assign(room).value();
    this.write();
    debug.room(`updateRoom: updated room: %O`, updatedRoom);
    return updatedRoom;
  }
}

export class FsRoomRepository implements RoomRepository {
  private readonly db: FsRoomDB;

  constructor(db: FsRoomDB) {
    this.db = db;

    db.read();
    if (!db.data) {
      db.data = {
        rooms: [],
        messages: [],
      };
      db.write();
    }
  }

  async createRoom(params: CreateRoomParams): Promise<Room> {
    this.db.read();
    const id = crypto.randomUUID();
    const newRoom = {
      id,
      ...params,
    };
    this.db.createRoom(newRoom);
    debug.room("created room: %O", newRoom);
    return newRoom;
  }

  async getRoom(id: string): Promise<Room> {
    this.db.read();
    const room = this.db.rooms.find({ id }).value();
    return room || null;
  }

  async renameRoom(params: RenameRoomParams): Promise<Room> {
    return this.db.updateRoom(params);
  }

  async saveMessage(message: IncomingMessage): Promise<Message> {
    this.db.read();
    const id = crypto.randomUUID();
    const newMessage = {
      ...message,
      id,
    };
    this.db.createMessage(newMessage);
    debug.room("saved message: %O", newMessage);
    return newMessage;
  }

  async getMessageHistory(roomId: string): Promise<Message[]> {
    this.db.read();
    return this.db.messages
      .filter({ roomId })
      .filter((message) => !isPrivate(message) && !message.transient)
      .sortBy((msg) => new Date(msg.time))
      .value();
  }
}
