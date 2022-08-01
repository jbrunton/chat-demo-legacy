import { AuditLogDB } from "@data/low/audit-log-db";
import { LowAuditLogRepository } from "@data/low/audit-log-repository";
import { RoomDB } from "@data/low/room-db";
import { LowRoomRepository } from "@data/low/room-repository";
import { LowUserRepository } from "@data/low/user-repository";
import { adapter, authDB } from "./auth-adapter";

const roomDB = RoomDB.createFileSystemDB();
const auditLogDB = AuditLogDB.createFileSystemDB();

export const userRepository = new LowUserRepository(adapter, authDB);
export const roomRepository = new LowRoomRepository(roomDB, authDB);
export const auditLogRepository = new LowAuditLogRepository(auditLogDB);
