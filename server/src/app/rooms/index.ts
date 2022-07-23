import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  countries,
} from "unique-names-generator";
import { RoomDB } from "src/data/low/room-db";
import { LowRoomRepository } from "src/data/low/room-repository";
import { AuthDB } from "@data/low/auth-db";
import { Room } from "@domain/entities/room";

export const roomDB = RoomDB.createFileSystemDB();
const authDB = AuthDB.createFileSystemDB();
export const roomRepository = new LowRoomRepository(roomDB, authDB);

const generateName = () => {
  const randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, countries],
    style: "capital",
    separator: " ",
    length: 3,
  });
  return randomName;
};

export const createRoom = async (ownerId: string): Promise<Room> => {
  const name = generateName();
  return await roomRepository.createRoom({
    name,
    ownerId,
  });
};

export const getRoom = async (id: string): Promise<Room> => {
  return await roomRepository.getRoom(id);
};