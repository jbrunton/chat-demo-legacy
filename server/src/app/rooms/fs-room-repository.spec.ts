import { Room } from "@domain/entities";
import { MemorySync } from "lowdb";
import { FsRoomDB, FsRoomRepository } from "./fs-room-repository";

describe("FsRoomRepository", () => {
  let db: FsRoomDB;
  let repo: FsRoomRepository;

  const testUserId = "1234";

  const testRoom: Room = {
    id: "a1b2c3",
    name: "Test Room",
    ownerId: testUserId,
  };

  beforeEach(() => {
    db = new FsRoomDB(new MemorySync());
    repo = new FsRoomRepository(db);
    db.createRoom(testRoom);
  });

  describe("createRoom", () => {
    it("creates a room", async () => {
      const room = await repo.createRoom({
        name: "New Room",
        ownerId: testUserId,
      });
      const newRoom = db.rooms.find({ id: room.id }).value();
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
      const room = db.rooms.find({ id: testRoom.id }).value();

      expect(room).toEqual(updatedRoom);
      expect(updatedRoom).toEqual({
        ...testRoom,
        name,
      });
    });
  });
});
