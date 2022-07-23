import { Room } from "@domain/entities";
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

  beforeEach(() => {
    roomDB = RoomDB.createMemoryDB();
    authDB = AuthDB.createMemoryDB();
    repo = new LowRoomRepository(roomDB, authDB);
    roomDB.createRoom(testRoom);
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
});
