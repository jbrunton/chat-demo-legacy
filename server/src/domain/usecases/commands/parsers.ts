import { Command } from "@domain/entities/commands";
import { HelpResponseParams } from "../help/help-response";
import { RenameRoomParams } from "../rooms/rename-room";
import { RenameUserParams } from "../users/rename-user";
import { ThrowErrorParams } from "./throw-error-command";

export type ParsedCommand =
  | { tag: "help"; params: HelpResponseParams }
  | { tag: "renameUser"; params: RenameUserParams }
  | { tag: "renameRoom"; params: RenameRoomParams }
  | { tag: "throwError"; params: ThrowErrorParams };

export interface CommandParser {
  (command: Command): ParsedCommand | undefined;
}

export const helpParser: CommandParser = (command) => {
  if (command.name === "help") {
    const params = {
      authenticatedUser: command.sender,
      roomId: command.roomId,
    };
    return { tag: "help", params };
  }
};

export const renameUserParser: CommandParser = (command) => {
  if (command.name === "rename" && command.args[0] === "user") {
    const params = {
      newName: command.args.slice(1).join(" ").trim(),
      roomId: command.roomId,
      authenticatedUser: command.sender,
    };
    return { tag: "renameUser", params };
  }
};

export const renameRoomParser: CommandParser = (command) => {
  if (command.name === "rename" && command.args[0] === "room") {
    const params = {
      newName: command.args.slice(1).join(" ").trim(),
      roomId: command.roomId,
      authenticatedUser: command.sender,
    };
    return { tag: "renameRoom", params };
  }
};

export const throwErrorParser: CommandParser = (command) => {
  if (command.name === "throw_error") {
    const params = {
      message: command.args.join(" ").trim(),
    };
    return { tag: "throwError", params };
  }
};

export const parsers: CommandParser[] = [
  helpParser,
  renameUserParser,
  renameRoomParser,
  throwErrorParser,
];
