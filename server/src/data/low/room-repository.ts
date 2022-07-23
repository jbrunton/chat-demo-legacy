import { debug } from "@app/debug";
import { chain, omit, pick } from "lodash";
import crypto from "crypto";
import { AuthDB } from "./auth-db";
import { RoomDB } from "./room-db";
import {
  CreateRoomParams,
  RenameRoomParams,
  Room,
  RoomRepository,
} from "@domain/entities/room";
import { isPrivate, Message, PublicMessage } from "@domain/entities/messages";
import { User } from "@domain/entities/user";

export class LowRoomRepository implements RoomRepository {
  private readonly roomDB: RoomDB;
  private readonly authDB: AuthDB;

  constructor(roomDB: RoomDB, authDB: AuthDB) {
    this.roomDB = roomDB;
    this.authDB = authDB;
  }

  async createRoom(params: CreateRoomParams): Promise<Room> {
    this.roomDB.read();
    const id = crypto.randomUUID();
    const newRoom = {
      id,
      ...params,
    };
    this.roomDB.createRoom(newRoom);
    debug.room("created room: %O", newRoom);
    return newRoom;
  }

  async getRoom(id: string): Promise<Room> {
    this.roomDB.read();
    const room = this.roomDB.rooms.find({ id }).value();
    return room || null;
  }

  async renameRoom(params: RenameRoomParams): Promise<Room> {
    return this.roomDB.updateRoom(params);
  }

  async saveMessage(message: PublicMessage): Promise<Message> {
    this.roomDB.read();
    const id = crypto.randomUUID();
    const newMessage = {
      id,
      senderId: message.sender?.id,
      ...omit(message, "sender"),
    };
    this.roomDB.createMessage(newMessage);
    debug.room("saved message: %O", newMessage);
    return newMessage;
  }

  async getMessageHistory(roomId: string): Promise<Message[]> {
    this.roomDB.read();
    const messages = this.roomDB.messages
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
