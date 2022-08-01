import { Mailer } from "@app/email/mailer";
import { createEtheralMailer } from "@app/email/mailers/ethereal";
import { createSendgridMailer } from "@app/email/mailers/sendgrid";
import { AuditLogDB } from "@data/low/audit-log-db";
import { LowAuditLogRepository } from "@data/low/audit-log-repository";
import { LowAuthAdapter } from "@data/low/auth-adapter";
import { AuthDB } from "@data/low/auth-db";
import { RoomDB } from "@data/low/room-db";
import { LowRoomRepository } from "@data/low/room-repository";
import { LowUserRepository } from "@data/low/user-repository";
import {
  Dependencies,
  DependencyReaderTask,
} from "@domain/usecases/dependencies";
import { Dispatcher } from "@domain/usecases/messages/dispatcher";
import { NextApiResponse } from "next";
import { Adapter } from "next-auth/adapters";
import { nameGenerator } from "./name-generator";

const authDB = AuthDB.createFileSystemDB();
const roomDB = RoomDB.createFileSystemDB();
const auditLogDB = AuditLogDB.createFileSystemDB();

export const adapter = new LowAuthAdapter(authDB);
const userRepository = new LowUserRepository(adapter, authDB);
const roomRepository = new LowRoomRepository(roomDB, authDB);
const auditLogRepository = new LowAuditLogRepository(auditLogDB);

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

export const withReqDeps = (res: NextApiResponse) => {
  const dispatcher = res.socket?.server?.dispatcher;
  if (!dispatcher) {
    throw Error("dispatcher is undefined");
  }
  const reqDependencies = {
    dispatcher,
    ...getDefaultDeps(),
  };
  return withDeps(reqDependencies);
};
