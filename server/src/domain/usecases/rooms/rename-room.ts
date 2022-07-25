import { DependencyReaderTask } from "../dependencies";
import {
  EntityNotFoundError,
  InvalidArgumentError,
  UnauthorisedUser,
} from "../../entities/errors";
import { PublicMessage } from "@domain/entities/messages";
import { User } from "@domain/entities/user";

export type RenameRoomParams = {
  newName: string;
  roomId: string;
  authenticatedUser: User;
};

export const renameRoom =
  (params: RenameRoomParams): DependencyReaderTask<PublicMessage> =>
  ({ roomRepository }) =>
  async () => {
    const { newName, authenticatedUser, roomId } = params;

    const room = await roomRepository.getRoom(roomId);
    if (!room) {
      throw EntityNotFoundError.create(roomId, "room");
    }

    if (room.ownerId !== authenticatedUser.id) {
      throw UnauthorisedUser.create(
        authenticatedUser.id,
        "renameRoom",
        `room (id=${roomId})`
      );
    }

    if (newName.length == 0) {
      throw new InvalidArgumentError("Please provide a valid name");
    }

    const updatedRoom = await roomRepository.renameRoom({
      id: roomId,
      name: newName,
    });

    const content = `${authenticatedUser.name} changed the room name to ${updatedRoom.name}`;
    return {
      content,
      roomId,
      time: new Date().toISOString(),
      updated: ["room"],
    };
  };
