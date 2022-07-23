import { Command } from "@domain/entities/commands";
import { Dependencies } from "../dependencies";
import { InvalidArgumentError } from "../../entities/errors";
import { ReaderTask } from "fp-ts/ReaderTask";
import { Message, PublicMessage } from "@domain/entities/messages";
import { ResponseBuilder } from "../commands/response-builder";
import { User } from "@domain/entities/user";

export type RenameUserParams = {
  newName: string;
  roomId: string;
  authenticatedUser: User;
};

export const renameUser =
  (params: RenameUserParams): ReaderTask<Dependencies, PublicMessage> =>
  ({ userRepository }) =>
  async () => {
    const { newName, roomId, authenticatedUser } = params;
    if (newName.length == 0) {
      throw new InvalidArgumentError("Please provide a valid username");
    }

    const updatedUser = await userRepository.rename(
      authenticatedUser.id,
      newName
    );

    const content = `${authenticatedUser.name} changed their name to ${updatedUser.name}`;
    return {
      content,
      roomId,
      time: new Date().toISOString(),
      updated: ["user"],
    };
  };
