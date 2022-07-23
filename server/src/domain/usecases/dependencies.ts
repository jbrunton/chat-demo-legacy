import { RoomRepository } from "@domain/entities/room";
import { UserRepository } from "@domain/entities/user";

export interface Dependencies {
  userRepository: UserRepository;
  roomRepository: RoomRepository;
}
