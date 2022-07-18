import { Room } from "@domain/entities";
import { JSONFileSync } from "lowdb";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  countries,
} from "unique-names-generator";
import { FsRoomDB, FsRoomRepository } from "./fs-room-repository";

export const roomDB = new FsRoomDB(new JSONFileSync("db/rooms.json"));
export const roomRepository = new FsRoomRepository(roomDB);

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
