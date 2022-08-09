import { ReqDependencies, withReqDeps } from "@app/dependencies";
import {
  RequestAdapter,
  ResponseAdapter,
} from "@app/dependencies/requests-adapters";
import {
  EntityError,
  EntityNotFoundError,
  InvalidArgumentError,
  UnauthorisedUser,
} from "@domain/entities/errors";
import { pipe } from "fp-ts/lib/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { NextApiRequest, NextApiResponse } from "next";

export const selectRequest = (
  method?: string
): RT.ReaderTask<ReqDependencies, RequestAdapter> =>
  pipe(
    RT.ask<ReqDependencies>(),
    RT.map(({ req }) => {
      if (method && req.method !== method) {
        throw InvalidArgumentError.create({
          argument: req.method,
          parameter: "method",
          expected: method,
        });
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
      res.sendResponse(201, response || {});
    })
  );

export type RequestPipeline = () => RT.ReaderTask<ReqDependencies, void>;
export type RequestParser<T> = RT.ReaderTask<ReqDependencies, T>;
export type RequestProcessor<T, R> = (
  req: RequestParser<T>
) => RT.ReaderTask<ReqDependencies, R>;

type ErrorHandler = (e: Error, res: ResponseAdapter) => void | Error;
export interface RequestPipelineDefinition<T, R> {
  parseRequest: RequestParser<T>;
  processRequest: RequestProcessor<T, R>;
  onError?: ErrorHandler;
}

export const buildRequestPipeline = <T, R>({
  parseRequest,
  processRequest,
  onError = defaultErrorHandler,
}: RequestPipelineDefinition<T, R>): RequestPipeline => {
  const pipeline = pipe(parseRequest, processRequest, RT.chain(sendResponse));
  const handler = pipe(
    RT.ask<ReqDependencies>(),
    RT.chain((deps) => TE.tryCatchK(pipeline(deps), E.toError)),
    RTE.getOrElse(handleError(onError))
  );
  return () => handler;
};

export const defaultErrorHandler: ErrorHandler = (
  e: Error,
  res: ResponseAdapter
) => {
  const sendResponse = (httpCode: number) =>
    res.sendResponse(httpCode, { error: e.message });
  if (e instanceof EntityError) {
    if (e instanceof UnauthorisedUser) {
      return sendResponse(401);
    } else if (e instanceof EntityNotFoundError) {
      return sendResponse(404);
    } else if (e instanceof InvalidArgumentError) {
      return sendResponse(422);
    }
  }
  return e;
};

const handleError =
  (onError?: ErrorHandler) =>
  (e: Error): RT.ReaderTask<ReqDependencies, void> => {
    return pipe(
      RT.ask<ReqDependencies>(),
      RT.chain((deps) =>
        RT.fromTask(async () => {
          const unhandledError = onError ? onError(e, deps.res) : e;
          if (unhandledError) {
            console.error(unhandledError);
            if (process.env.NODE_ENV === "development") {
              deps.res.sendResponse(500, { error: e.message, trace: e.stack });
            } else {
              deps.res.sendResponse(500, { error: "Unexpected error" });
            }
          }
        })
      )
    );
  };

export const buildRequestHandler = (pipeline: RequestPipeline) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await withReqDeps(req, res).run(pipeline());
  };
};
