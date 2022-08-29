import { ReqDependencies } from "@app/dependencies";
import { RequestAdapter } from "@app/dependencies/requests-adapters";
import { InvalidArgumentError } from "@domain/entities/errors";
import { pipe } from "fp-ts/lib/function";
import * as RT from "fp-ts/ReaderTask";

export const selectRequest = (
  method?: string
): RT.ReaderTask<ReqDependencies, RequestAdapter> =>
  pipe(
    RT.ask<ReqDependencies>(),
    RT.map(({ req }) => {
      if (method && req.method !== method) {
        throw new InvalidArgumentError(`Expected ${method}`);
      }
      return req;
    })
  );

export const sendResponse = <T>(
  response: T
): RT.ReaderTask<ReqDependencies, void> =>
  pipe(
    RT.ask<ReqDependencies>(),
    RT.map(({ res }) => {
      res.sendResponse(201, response);
    })
  );
