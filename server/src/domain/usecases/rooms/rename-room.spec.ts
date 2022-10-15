import { AuditLogDB } from "@data/quick/audit-log-db";
import { LowAuditLogRepository } from "@data/quick/audit-log-repository";
import { QuickDbAuthAdapter } from "@data/quick/auth-adapter";
import { AuthDB } from "@data/quick/auth-db";
import { RoomDB } from "@data/quick/room-db";
import { LowRoomRepository } from "@data/quick/room-repository";
import { LowUserRepository } from "@data/quick/user-repository";
import {
  EntityNotFoundError,
  InvalidArgumentError,
  UnauthorisedUser,
} from "@domain/entities/errors";
import { NameGenerator } from "@domain/entities/name-generator";
import { Room } from "@domain/entities/room";
import { User } from "@domain/entities/user";
import { mock } from "jest-mock-extended";
import { Dependencies, withDeps } from "../dependencies";
import { renameRoom } from "./rename-room";

describe("renameRoom", () => {
  let deps: Dependencies;

  const roomId = "test-room-id";
  const ownerId = "owner-id";

  const testRoom: Room = {
    id: roomId,
    name: "Test Room",
    ownerId,
  };

  const roomOwner: User = {
    id: ownerId,
    name: "Room Owner",
  };

  beforeEach(async () => {
    const authDB = AuthDB.createMemoryDB();
    const roomDB = RoomDB.createMemoryDB();
    const auditLogDB = AuditLogDB.createMemoryDB();
    const adapter = new QuickDbAuthAdapter(authDB);
    const nameGenerator = mock<NameGenerator>();

    roomDB.createRoom(testRoom);

    deps = {
      userRepository: new LowUserRepository(adapter, authDB),
      roomRepository: new LowRoomRepository(roomDB, authDB),
      auditLogRepository: new LowAuditLogRepository(auditLogDB),
      nameGenerator,
    };
  });

  it("renames the room", async () => {
    const params = {
      roomId,
      newName: "New Name",
      authenticatedUser: roomOwner,
    };

    const response = await withDeps(deps).run(renameRoom(params));

    const updatedRoom = await deps.roomRepository.getRoom(roomId);
    expect(updatedRoom).toEqual({
      ...testRoom,
      name: "New Name",
    });
    expect(response).toMatchObject({
      roomId,
      content: "Room Owner changed the room name to New Name",
      updated: ["room"],
    });
  });

  it("validates the room", async () => {
    const params = {
      roomId: "not-a-room",
      newName: "New Name",
      authenticatedUser: roomOwner,
    };

    await expect(() => withDeps(deps).run(renameRoom(params))).rejects.toEqual(
      new EntityNotFoundError("Could not find room (id=not-a-room)")
    );
  });

  it("authorises the user", async () => {
    const params = {
      roomId,
      newName: "New Name",
      authenticatedUser: {
        id: "another-user",
        name: "Another User",
      },
    };

    await expect(() => withDeps(deps).run(renameRoom(params))).rejects.toEqual(
      new UnauthorisedUser(
        "User another-user is not authorised to perform renameRoom on room (id=test-room-id)"
      )
    );
  });

  it("validates the name", async () => {
    const params = {
      roomId,
      newName: "",
      authenticatedUser: roomOwner,
    };

    await expect(() => withDeps(deps).run(renameRoom(params))).rejects.toEqual(
      new InvalidArgumentError("Please provide a valid name")
    );
  });
});
