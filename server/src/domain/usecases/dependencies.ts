import { NameGenerator } from "@domain/entities/name-generator";
import { RoomRepository } from "@domain/entities/room";
import { UserRepository } from "@domain/entities/user";
import { AuditLogRepository } from "@domain/entities/audit-log";

export interface Dependencies {
  userRepository: UserRepository;
  roomRepository: RoomRepository;
  auditLogRepository: AuditLogRepository;
  nameGenerator: NameGenerator;
}
