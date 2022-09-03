import { Mailer } from "@app/email/mailer";
import { createEtheralMailer } from "@app/email/mailers/ethereal";
import { createSendgridMailer } from "@app/email/mailers/sendgrid";
import { Dependencies, withDeps } from "@domain/usecases/dependencies";
import { Dispatcher } from "@domain/usecases/messages/dispatcher";
import { NextApiRequest, NextApiResponse } from "next";
import { Adapter } from "next-auth/adapters";
import { NextSessionRepository, SessionRepository } from "./session-repository";
import { nameGenerator } from "./name-generator";
import { adapter } from "./auth-adapter";
import {
  auditLogRepository,
  roomRepository,
  userRepository,
} from "./repositories";
import {
  NextRequestAdapter,
  NextResponseAdapter,
  RequestAdapter,
  ResponseAdapter,
} from "./requests-adapters";
import * as RT from "fp-ts/ReaderTask";
import { createSocketDispatcher } from "./socket-dispatcher";

const createMailer = () => {
  switch (process.env.EMAIL_TRANSPORT) {
    case "sendgrid":
      return createSendgridMailer();
    case "ethereal":
      return createEtheralMailer();
    default:
      throw new Error(
        `EMAIL_TRANSPORT must be sendgrid or ethereral, was ${process.env.EMAIL_TRANSPORT}`
      );
  }
};

export type AppDependencies = Dependencies & {
  adapter: Adapter;
  mailer: Mailer;
};

export type ReqDependencies = AppDependencies & {
  req: RequestAdapter;
  res: ResponseAdapter;
  sessionRepository: SessionRepository;
  dispatcher: Dispatcher;
};

export const getDefaultDeps = (): AppDependencies => ({
  adapter,
  userRepository,
  roomRepository,
  auditLogRepository,
  nameGenerator,
  mailer: createMailer(),
});

export const widenDependencies = <T, D1, D2 extends D1>(
  task: RT.ReaderTask<D1, T>
) => RT.local((d: D2) => d as D1)(task);

export const withDefaultDeps = () => withDeps(getDefaultDeps());

export const withReqDeps = (req: NextApiRequest, res: NextApiResponse) => {
  const dispatcher = createSocketDispatcher(res);

  const sessionRepository = NextSessionRepository(req, res);

  const reqDependencies: ReqDependencies = {
    req: NextRequestAdapter(req),
    res: NextResponseAdapter(res),
    dispatcher,
    sessionRepository,
    ...getDefaultDeps(),
  };

  return withDeps(reqDependencies);
};
