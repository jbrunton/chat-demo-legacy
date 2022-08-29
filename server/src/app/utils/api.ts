import { ReqDependencies, withReqDeps } from "@app/dependencies";
import { RequestAdapter } from "@app/dependencies/requests-adapters";
import { InvalidArgumentError } from "@domain/entities/errors";
import { pipe } from "fp-ts/lib/function";
import * as RT from "fp-ts/ReaderTask";
import { NextApiRequest, NextApiResponse } from "next";

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

export type RequestPipeline = () => RT.ReaderTask<ReqDependencies, void>;
export type RequestParser<T> = RT.ReaderTask<ReqDependencies, T>;
export type RequestProcessor<T, R> = (
  req: RequestParser<T>
) => RT.ReaderTask<ReqDependencies, R>;

export interface RequestPipelineDefinition<T, R> {
  parseRequest: RequestParser<T>;
  processRequest: RequestProcessor<T, R>;
}

export const buildRequestPipeline = <T, R>({
  parseRequest,
  processRequest,
}: RequestPipelineDefinition<T, R>): RequestPipeline => {
  return () => pipe(parseRequest, processRequest, RT.chain(sendResponse));
};

export const buildRequestHandler = (pipeline: RequestPipeline) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await withReqDeps(req, res).run(pipeline());
  };
};
