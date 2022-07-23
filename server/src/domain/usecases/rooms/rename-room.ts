import { Command } from "@domain/entities/commands";
import { Dependencies } from "../dependencies";
import { InvalidArgumentError } from "../../entities/errors";
import { ReaderTask } from "fp-ts/ReaderTask";
import { Message, PublicMessage } from "@domain/entities/messages";
import { ResponseBuilder } from "../commands/response-builder";
import { User } from "@domain/entities/user";

export type RenameRoomParams = {
  newName: string;
  roomId: string;
  authenticatedUser: User;
};

export const renameRoom =
  (params: RenameRoomParams): ReaderTask<Dependencies, PublicMessage> =>
  ({ roomRepository }) =>
  async () => {
    const { newName, authenticatedUser, roomId } = params;
    const room = await roomRepository.getRoom(roomId);
    if (room.ownerId !== authenticatedUser.id) {
      throw new InvalidArgumentError("Only the owner can rename the room");
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
