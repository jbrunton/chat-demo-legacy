import { AuditLogDB } from "@data/quick/audit-log-db";
import { LowAuditLogRepository } from "@data/quick/audit-log-repository";
import { RoomDB } from "@data/quick/room-db";
import { LowRoomRepository } from "@data/quick/room-repository";
import { LowUserRepository } from "@data/quick/user-repository";
import { adapter, authDB } from "./auth-adapter";

const roomDB = RoomDB.createFileSystemDB();
const auditLogDB = AuditLogDB.createFileSystemDB();

export const userRepository = new LowUserRepository(adapter, authDB);
export const roomRepository = new LowRoomRepository(roomDB, authDB);
export const auditLogRepository = new LowAuditLogRepository(auditLogDB);
