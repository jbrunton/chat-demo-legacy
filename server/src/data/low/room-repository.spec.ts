import { MembershipStatus, Room } from "@domain/entities/room";
import { AuthDB } from "./auth-db";
import { RoomDB } from "./room-db";
import { LowRoomRepository } from "./room-repository";

describe("FsRoomRepository", () => {
  let roomDB: RoomDB;
  let authDB: AuthDB;
  let repo: LowRoomRepository;

  const testUserId = "1234";

  const testRoom: Room = {
    id: "a1b2c3",
    name: "Test Room",
    ownerId: testUserId,
  };

  const now = new Date("2022-02-02T21:22:23.234Z");
  const then = new Date("2022-01-02T21:22:23.234Z");

  beforeEach(() => {
    roomDB = RoomDB.createMemoryDB();
    authDB = AuthDB.createMemoryDB();
    repo = new LowRoomRepository(roomDB, authDB);
    roomDB.createRoom(testRoom);
    jest.useFakeTimers().setSystemTime(now);
  });

  describe("createRoom", () => {
    it("creates a room", async () => {
      const room = await repo.createRoom({
        name: "New Room",
        ownerId: testUserId,
      });
      const newRoom = roomDB.rooms.find({ id: room.id }).value();
      expect(room).toMatchObject({
        name: "New Room",
        ownerId: testUserId,
      });
      expect(newRoom).toEqual(room);
    });
  });

  describe("getRoom", () => {
    it("finds the room by id", async () => {
      const room = await repo.getRoom(testRoom.id);
      expect(room).toEqual(testRoom);
    });

    it("returns null otherwise", async () => {
      const room = await repo.getRoom("not-a-room");
      expect(room).toBeNull();
    });
  });

  describe("renameRoom", () => {
    it("renames the room", async () => {
      const name = "New Name";

      const updatedRoom = await repo.renameRoom({
        id: testRoom.id,
        name,
      });

      const room = roomDB.rooms.find({ id: testRoom.id }).value();
      expect(room).toEqual(updatedRoom);
      expect(updatedRoom).toEqual({
        ...testRoom,
        name,
      });
    });
  });

  describe("setMembershipStatus", () => {
    const params = {
      userId: testUserId,
      roomId: testRoom.id,
    };

    it("adds a new row for a user without membership", async () => {
      const status = MembershipStatus.Joined;

      await repo.setMembershipStatus(params, status);

      const memberships = roomDB.memberships.filter(params).value();
      expect(memberships).toEqual([
        {
          ...params,
          status,
          from: now.toISOString(),
        },
      ]);
    });

    it("adds a new row and closes the previous one for a user with existing membership", async () => {
      const initialStatus = MembershipStatus.PendingApproval;
      roomDB.createMembership({
        ...params,
        status: initialStatus,
        from: then.toISOString(),
      });

      const newStatus = MembershipStatus.Joined;
      await repo.setMembershipStatus(params, newStatus);

      const memberships = roomDB.memberships.filter(params).value();
      expect(memberships).toEqual([
        {
          ...params,
          status: initialStatus,
          from: then.toISOString(),
          until: now.toISOString(),
        },
        {
          ...params,
          status: newStatus,
          from: now.toISOString(),
        },
      ]);
    });
  });

  describe("getMembershipStatus", () => {
    const params = {
      userId: testUserId,
      roomId: testRoom.id,
    };

    it("returns None if no membership exists", async () => {
      const status = await repo.getMembershipStatus(params);
      expect(status).toEqual(MembershipStatus.None);
    });

    it("returns the open status if there is one", async () => {
      roomDB.createMembership({
        ...params,
        status: MembershipStatus.PendingApproval,
        from: then.toISOString(),
        until: now.toISOString(),
      });
      roomDB.createMembership({
        ...params,
        status: MembershipStatus.Joined,
        from: now.toISOString(),
      });
      roomDB.createMembership({
        ...params,
        status: MembershipStatus.Revoked,
        from: then.toISOString(),
        until: now.toISOString(),
      });

      const status = await repo.getMembershipStatus(params);

      expect(status).toEqual(MembershipStatus.Joined);
    });
  });

  describe("getJoinedRooms", () => {
    const params = {
      userId: testUserId,
      roomId: testRoom.id,
    };

    it("returns the rooms a user has joined", async () => {
      roomDB.createMembership({
        ...params,
        status: MembershipStatus.Joined,
        from: now.toISOString(),
      });

      const rooms = await repo.getJoinedRooms(testUserId);

      expect(rooms).toEqual([testRoom]);
    });
  });
});
