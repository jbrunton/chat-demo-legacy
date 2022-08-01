import { ReqDependencies } from "@app/dependencies";
import {
  RequestAdapter,
  ResponseAdapter,
} from "@app/dependencies/requests-adapters";
import { SessionRepository } from "@app/dependencies/session-repository";
import { Mailer } from "@app/email/mailer";
import { AuditLogRepository } from "@domain/entities/audit-log";
import { NameGenerator } from "@domain/entities/name-generator";
import { RoomRepository } from "@domain/entities/room";
import { UserRepository } from "@domain/entities/user";
import { Dispatcher } from "@domain/usecases/messages/dispatcher";
import { mock, MockProxy } from "jest-mock-extended";
import { Adapter } from "next-auth/adapters";

export type MockReqDependencies = {
  [K in keyof ReqDependencies]: MockProxy<ReqDependencies[K]>;
};

export const mockReqDependencies = (): MockReqDependencies => {
  const dependencies = {
    userRepository: mock<UserRepository>(),
    roomRepository: mock<RoomRepository>(),
    auditLogRepository: mock<AuditLogRepository>(),
    nameGenerator: mock<NameGenerator>(),
    adapter: mock<Adapter>(),
    mailer: mock<Mailer>(),
    req: mock<RequestAdapter>(),
    res: mock<ResponseAdapter>(),
    sessionRepository: mock<SessionRepository>(),
    dispatcher: mock<Dispatcher>(),
  };

  return dependencies;
};
