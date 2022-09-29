import { Command } from "@domain/entities/commands";
import { Message } from "@domain/entities/messages";
import { Dependencies } from "../dependencies";
import { EntityError } from "../../entities/errors";
import { renameRoom } from "../rooms/rename-room";
import { renameUser } from "../users/rename-user";
import { pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import { ReaderTask } from "fp-ts/ReaderTask";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as RTE from "fp-ts/ReaderTaskEither";
import { ResponseBuilder } from "./response-builder";
import { helpResponse } from "../help/help-response";
import { ParsedCommand, parsers } from "./parsers";
import { throwError } from "./throw-error-command";

const unrecognisedResponse =
  "Unrecognised command, type <b>/help</b> for further assistance";

export const processCommand = (
  command: Command
): RT.ReaderTask<Dependencies, Message> => {
  for (const parse of parsers) {
    const parsedCommand = parse(command);
    if (parsedCommand) {
      return pipe(
        RT.ask<Dependencies>(),
        RT.chain((deps) =>
          TE.tryCatchK(executeCommand(parsedCommand)(deps), E.toError)
        ),
        RTE.getOrElse(handleCommandError(command))
      );
    }
  }

  return RT.of(
    ResponseBuilder(command).privateResponse({
      content: unrecognisedResponse,
    })
  );
};

const executeCommand = ({
  tag,
  params,
}: ParsedCommand): ReaderTask<Dependencies, Message> => {
  switch (tag) {
    case "help":
      return helpResponse(params);
    case "renameUser":
      return renameUser(params);
    case "renameRoom":
      return renameRoom(params);
    case "throwError":
      return throwError(params);
  }
};

const handleCommandError =
  (command: Command) =>
  (e: Error): ReaderTask<Dependencies, Message> => {
    if (e instanceof EntityError) {
      return RT.of(
        ResponseBuilder(command).privateResponse({
          content: e.message,
        })
      );
    }
    throw e;
  };
