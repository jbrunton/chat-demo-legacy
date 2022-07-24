import { LowAuthAdapter } from "@data/low/auth-adapter";
import { AuthDB } from "@data/low/auth-db";
import { RoomDB } from "@data/low/room-db";
import { LowRoomRepository } from "@data/low/room-repository";
import { LowUserRepository } from "@data/low/user-repository";
import { NameGenerator } from "@domain/entities/name-generator";
import { Dependencies } from "@domain/usecases/dependencies";
import { Adapter } from "next-auth/adapters";
import {
  adjectives,
  animals,
  colors,
  countries,
  uniqueNamesGenerator,
} from "unique-names-generator";

const authDB = AuthDB.createFileSystemDB();
const roomDB = RoomDB.createFileSystemDB();

const adapter = new LowAuthAdapter(authDB);

const userRepository = new LowUserRepository(adapter, authDB);
const roomRepository = new LowRoomRepository(roomDB, authDB);

const getPlaceName = () => {
  const randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, countries],
    style: "capital",
    separator: " ",
    length: 3,
  });
  return randomName;
};

const getAnimalName = () => {
  const randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    style: "capital",
    separator: " ",
    length: 2,
  });
  return `Anon ${randomName}`;
};

const nameGenerator: NameGenerator = {
  getPlaceName,
  getAnimalName,
};

type AppDependencies = Dependencies & {
  adapter: Adapter;
};

export const dependencies: AppDependencies = {
  adapter,
  userRepository,
  roomRepository,
  nameGenerator,
};
