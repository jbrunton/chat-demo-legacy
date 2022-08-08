import { User } from "@domain/entities/user";
import { pick } from "lodash";
import { NextApiRequest } from "next";
import { NextApiResponse } from "next";

export interface RequestAdapter {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  user?: User;
}

export interface ResponseAdapter {
  sendResponse<T>(statusCode: number, body: T): void;
}

export const NextRequestAdapter = (req: NextApiRequest): RequestAdapter => {
  return pick(req, ["method", "query", "body"]);
};

export const NextResponseAdapter = (res: NextApiResponse): ResponseAdapter => {
  return {
    sendResponse(statusCode, body) {
      res.status(statusCode).send(body);
    },
  };
};
