import { Command } from "@domain/entities/commands";
import { Room, RoomRepository } from "@domain/entities/room";
import { User, UserRepository } from "@domain/entities/user";
import { mock, MockProxy } from "jest-mock-extended";
import { Dependencies } from "../dependencies";
import { processCommand } from "./process-command";

describe("#processCommand", () => {
  const time = "2022-01-01T10:30:00.000Z";
  const roomId = "a1b2c3";
  const testUser: User = {
    id: "123",
    name: "Some User",
  };
  const anotherUser: User = {
    id: "456",
    name: "Another User",
  };

  let userRepository: MockProxy<UserRepository>;
  let roomRepository: MockProxy<RoomRepository>;
  let deps: Dependencies;

  beforeEach(() => {
    userRepository = mock<UserRepository>();
    roomRepository = mock<RoomRepository>();
    deps = {
      userRepository,
      roomRepository,
    };
    jest.useFakeTimers().setSystemTime(new Date(time));
  });

  it("generates an error response when given an invalid command", async () => {
    const command: Command = {
      name: "invalidcommand",
      args: [],
      sender: testUser,
      roomId,
      time,
    };
    const response = await processCommand(command)(deps)();
    expect(response).toEqual({
      content: "Unrecognised command, type <b>/help</b> for further assistance",
      recipientId: testUser.id,
      roomId,
      time,
    });
  });

  describe("/help", () => {
    it("generates a help response", async () => {
      const command: Command = {
        name: "help",
        args: [],
        sender: testUser,
        roomId,
        time,
      };
      const response = await processCommand(command)(deps)();
      expect(response).toEqual({
        content: [
          "\n<p>Type to chat, or enter one of the following commands:</p>\n",
          "<b>/help</b>: list commands<br />\n",
          "<b>/rename user &lt;name&gt;</b>: change your display name<br />\n",
          "<b>/rename room &lt;name&gt;</b>: change the room name<br />\n",
        ].join(""),
        recipientId: testUser.id,
        roomId,
        time,
      });
    });
  });

  describe("/rename user", () => {
    it("renames the signed in user", async () => {
      userRepository.rename.mockResolvedValue({
        id: testUser.id,
        name: "New Name",
      });
      const command: Command = {
        name: "rename",
        args: ["user", "New", "Name"],
        sender: testUser,
        roomId,
        time,
      };

      const response = await processCommand(command)(deps)();

      expect(userRepository.rename).toHaveBeenCalledWith(
        testUser.id,
        "New Name"
      );
      expect(response).toEqual({
        content: "Some User changed their name to New Name",
        roomId,
        time,
        updated: ["user"],
      });
    });

    it("requires a valid username", async () => {
      const command: Command = {
        name: "rename",
        args: ["user", " "],
        sender: testUser,
        roomId,
        time,
      };

      const response = await processCommand(command)(deps)();

      expect(userRepository.rename).not.toHaveBeenCalled();
      expect(response).toEqual({
        content: "Please provide a valid username",
        roomId,
        time,
        recipientId: testUser.id,
      });
    });
  });

  describe("/rename room", () => {
    const testRoom: Room = {
      id: roomId,
      name: "Test Room",
      ownerId: testUser.id,
    };

    beforeEach(() => {
      roomRepository.getRoom
        .calledWith(testRoom.id)
        .mockResolvedValue(testRoom);
    });

    it("renames the room", async () => {
      roomRepository.renameRoom.mockResolvedValue({
        id: roomId,
        name: "New Name",
        ownerId: testUser.id,
      });
      const command: Command = {
        name: "rename",
        args: ["room", "New", "Name"],
        sender: testUser,
        roomId,
        time,
      };

      const response = await processCommand(command)(deps)();

      expect(roomRepository.renameRoom).toHaveBeenCalledWith({
        id: roomId,
        name: "New Name",
      });
      expect(response).toEqual({
        content: "Some User changed the room name to New Name",
        roomId,
        time,
        updated: ["room"],
      });
    });

    it("requires a valid name", async () => {
      const command: Command = {
        name: "rename",
        args: ["room", " "],
        sender: testUser,
        roomId,
        time,
      };

      const response = await processCommand(command)(deps)();

      expect(roomRepository.renameRoom).not.toHaveBeenCalled();
      expect(response).toEqual({
        content: "Please provide a valid name",
        roomId,
        time,
        recipientId: testUser.id,
      });
    });

    it("requires the sender to be the owner", async () => {
      const command: Command = {
        name: "rename",
        args: ["room", "New", "Name"],
        sender: anotherUser,
        roomId,
        time,
      };

      const response = await processCommand(command)(deps)();

      expect(roomRepository.renameRoom).not.toHaveBeenCalled();
      expect(response).toEqual({
        content: "Only the owner can rename the room",
        roomId,
        time,
        recipientId: anotherUser.id,
      });
    });
  });
});
