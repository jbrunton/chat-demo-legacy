import { Mailer } from "@app/email/mailer";
import { createEtheralMailer } from "@app/email/mailers/ethereal";
import { createSendgridMailer } from "@app/email/mailers/sendgrid";
import {
  Dependencies,
  DependencyReaderTask,
} from "@domain/usecases/dependencies";
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

export const withDeps = <D = Dependencies>(dependencies: D) => ({
  run<T>(task: DependencyReaderTask<T, D>) {
    return task(dependencies)();
  },
});

export const withDefaultDeps = () => withDeps(getDefaultDeps());

export const withReqDeps = (req: NextApiRequest, res: NextApiResponse) => {
  const dispatcher = res.socket?.server?.dispatcher;
  if (!dispatcher) {
    throw Error("dispatcher is undefined");
  }

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
