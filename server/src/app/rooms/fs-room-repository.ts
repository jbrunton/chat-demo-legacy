import { debug } from "@app/debug";
import { Room } from "@domain/entities";
import {
  CreateRoomParams,
  RoomRepository,
} from "@domain/usecases/rooms/create-room";
import { chain, ExpChain } from "lodash";
import { LowSync } from "lowdb";
import crypto from "crypto";

export type Data = {
  rooms: Room[];
};

export class FsRoomDB extends LowSync<Data> {
  chain: ExpChain<this["data"]> = chain(this).get("data");

  rooms: ExpChain<Data["rooms"]> = this.chain.get("rooms");

  createRoom(room: Room) {
    this.data?.rooms.push(room);
    this.write();
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
}
