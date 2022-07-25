import { withDeps } from "@app/dependencies";
import { nameGenerator } from "@app/dependencies/name-generator";
import { LowAuthAdapter } from "@data/low/auth-adapter";
import { AuthDB } from "@data/low/auth-db";
import { RoomDB } from "@data/low/room-db";
import { LowRoomRepository } from "@data/low/room-repository";
import { LowUserRepository } from "@data/low/user-repository";
import {
  EntityNotFoundError,
  InvalidArgumentError,
  UnauthorisedUser,
} from "@domain/entities/errors";
import { Room } from "@domain/entities/room";
import { User } from "@domain/entities/user";
import { Dependencies } from "../dependencies";
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
    const adapter = new LowAuthAdapter(authDB);

    roomDB.createRoom(testRoom);

    deps = {
      userRepository: new LowUserRepository(adapter, authDB),
      roomRepository: new LowRoomRepository(roomDB, authDB),
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
