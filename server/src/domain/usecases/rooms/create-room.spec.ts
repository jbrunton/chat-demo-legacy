import { AuditLogDB } from "@data/low/audit-log-db";
import { LowAuditLogRepository } from "@data/low/audit-log-repository";
import { LowAuthAdapter } from "@data/low/auth-adapter";
import { AuthDB } from "@data/low/auth-db";
import { RoomDB } from "@data/low/room-db";
import { LowRoomRepository } from "@data/low/room-repository";
import { LowUserRepository } from "@data/low/user-repository";
import { NameGenerator } from "@domain/entities/name-generator";
import { MembershipStatus } from "@domain/entities/room";
import { mock, MockProxy } from "jest-mock-extended";
import { Dependencies, withDeps } from "../dependencies";
import { createRoom } from "./create-room";

describe("createRoom", () => {
  let deps: Dependencies & {
    nameGenerator: MockProxy<NameGenerator>;
  };

  const ownerId = "owner-id";

  beforeEach(async () => {
    const authDB = AuthDB.createMemoryDB();
    const roomDB = RoomDB.createMemoryDB();
    const auditLogDB = AuditLogDB.createMemoryDB();
    const adapter = new LowAuthAdapter(authDB);
    const nameGenerator = mock<NameGenerator>();

    deps = {
      userRepository: new LowUserRepository(adapter, authDB),
      roomRepository: new LowRoomRepository(roomDB, authDB),
      auditLogRepository: new LowAuditLogRepository(auditLogDB),
      nameGenerator,
    };
  });

  it("creates a room with the given name", async () => {
    const params = {
      ownerId,
      name: "New Room",
    };

    const room = await withDeps(deps).run(createRoom(params));

    expect(room).toEqual({
      id: room.id,
      ...params,
    });
  });

  it("creates a room with a randomly generated name", async () => {
    const params = {
      ownerId,
    };
    deps.nameGenerator.getPlaceName.mockReturnValue("Random Place");

    const room = await withDeps(deps).run(createRoom(params));

    expect(room).toEqual({
      id: room.id,
      ownerId,
      name: "Random Place",
    });
  });

  it("assigns membership to the creator", async () => {
    const params = {
      ownerId,
      name: "New Room",
    };

    const room = await withDeps(deps).run(createRoom(params));

    const membershipStatus = await deps.roomRepository.getMembershipStatus({
      roomId: room.id,
      userId: ownerId,
    });
    expect(membershipStatus).toEqual(MembershipStatus.Joined);
  });
});
