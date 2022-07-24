import { ReaderTask } from "fp-ts/ReaderTask";
import { NameGenerator } from "@domain/entities/name-generator";
import { RoomRepository } from "@domain/entities/room";
import { UserRepository } from "@domain/entities/user";

export interface Dependencies {
  userRepository: UserRepository;
  roomRepository: RoomRepository;
  nameGenerator: NameGenerator;
}

export type DependencyReader<T> = ReaderTask<Dependencies, T>;
