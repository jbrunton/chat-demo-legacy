import { Command } from "@domain/entities";
import { RoomRepository } from "../rooms/repository";
import { InvalidArgumentError } from "./InvalidArgumentError";

export const renameRoom = async (
  command: Command,
  repo: RoomRepository
): Promise<string> => {
  const { roomId, sender } = command;
  const room = await repo.getRoom(roomId);
  if (room.ownerId !== sender.id) {
    throw new InvalidArgumentError("Only the owner can rename the room");
  }

  const newName = command.args.slice(1).join(" ").trim();
  if (newName.length == 0) {
    throw new InvalidArgumentError("Please provide a valid name");
  }

  const updatedRoom = await repo.renameRoom({ id: roomId, name: newName });
  return `${command.sender.name} changed the room name to ${updatedRoom.name}`;
};
