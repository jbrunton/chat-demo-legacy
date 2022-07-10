import { Command, User } from "@domain/entities";
import { mock, MockProxy } from "jest-mock-extended";
import { processCommand } from "./process-command";
import { UserRepository } from "./rename-user";

describe("#processCommand", () => {
  const time = "2022-01-01T10:30:00.000Z";
  const roomId = "a1b2c3";
  const sender: User = {
    id: "123",
    name: "Some User",
  };

  let userRepo: MockProxy<UserRepository>;

  beforeEach(() => {
    userRepo = mock<UserRepository>();
  });

  it("generates an error response when given an invalid command", async () => {
    const command: Command = {
      name: "invalidcommand",
      args: [],
      sender,
      roomId,
      time,
    };
    const response = await processCommand(command, userRepo);
    expect(response).toEqual({
      content: "Unrecognised command, type <b>/help</b> for further assistance",
      recipientId: sender.id,
      roomId,
      time,
    });
  });

  describe("/help", () => {
    it("generates a help response", async () => {
      const command: Command = {
        name: "help",
        args: [],
        sender,
        roomId,
        time,
      };
      const response = await processCommand(command, userRepo);
      expect(response).toEqual({
        content: [
          "\n<p>Type to chat, or enter one of the following commands:</p>\n",
          "<b>/help</b>: list commands<br />\n",
          "<b>/rename user &lt;name&gt;</b>: change your display name<br />\n",
        ].join(""),
        recipientId: sender.id,
        roomId,
        time,
      });
    });
  });

  describe("/rename user", () => {
    it("renames the signed in user", async () => {
      userRepo.rename.mockResolvedValue({ id: sender.id, name: "New Name" });
      const command: Command = {
        name: "rename",
        args: ["user", "New", "Name"],
        sender,
        roomId,
        time,
      };

      const response = await processCommand(command, userRepo);

      expect(userRepo.rename).toHaveBeenCalledWith(sender.id, "New Name");
      expect(response).toEqual({
        content: "Some User changed their name to New Name",
        roomId,
        time,
      });
    });
  });
});
