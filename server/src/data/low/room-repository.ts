import { debug } from "@app/debug";
import {
  isPrivate,
  Message,
  PublicMessage,
  Room,
  User,
} from "@domain/entities";
import {
  CreateRoomParams,
  RenameRoomParams,
  RoomRepository,
} from "@domain/usecases/rooms/repository";
import { chain, omit, pick } from "lodash";
import crypto from "crypto";
import { AuthDB } from "./auth-db";
import { RoomDB } from "./room-db";

export class LowRoomRepository implements RoomRepository {
  private readonly db: RoomDB;
  private readonly authDB: AuthDB;

  constructor(db: RoomDB, authDB: AuthDB) {
    this.db = db;
    this.authDB = authDB;

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

  async saveMessage(message: PublicMessage): Promise<Message> {
    this.db.read();
    const id = crypto.randomUUID();
    const newMessage = {
      id,
      senderId: message.sender?.id,
      ...omit(message, "sender"),
    };
    this.db.createMessage(newMessage);
    debug.room("saved message: %O", newMessage);
    return newMessage;
  }

  async getMessageHistory(roomId: string): Promise<Message[]> {
    this.db.read();
    const messages = this.db.messages
      .filter({ roomId })
      .filter((message) => !isPrivate(message) && !message.transient)
      .sortBy((msg) => new Date(msg.time))
      .value();
    const senderIds = chain(messages)
      .map((msg) => msg.senderId)
      .uniq()
      .compact()
      .value();
    const senders = await this.getUsers(senderIds);
    const sendersMap = new Map(senders.map((sender) => [sender.id, sender]));
    return messages.map((msg) => ({
      ...msg,
      sender: msg.senderId ? sendersMap.get(msg.senderId) : undefined,
    }));
  }

  async getUsers(ids: string[]): Promise<User[]> {
    this.authDB.read();
    return this.authDB.users
      .filter((user) => ids.includes(user.id))
      .map((user) => pick(user, "id", "name") as User)
      .value();
  }
}
