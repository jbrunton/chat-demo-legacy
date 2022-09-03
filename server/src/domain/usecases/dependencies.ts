import { NameGenerator } from "@domain/entities/name-generator";
import { RoomRepository } from "@domain/entities/room";
import { UserRepository } from "@domain/entities/user";
import { AuditLogRepository } from "@domain/entities/audit-log";
import { ReaderTask } from "fp-ts/ReaderTask";

export interface Dependencies {
  userRepository: UserRepository;
  roomRepository: RoomRepository;
  auditLogRepository: AuditLogRepository;
  nameGenerator: NameGenerator;
}

export const withDeps = <D = Dependencies>(dependencies: D) => ({
  run<T>(task: ReaderTask<D, T>) {
    return task(dependencies)();
  },
});
