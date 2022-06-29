import { Command, User } from "@domain/entities";
import { processCommand } from "./process-command";

describe("#processCommand", () => {
  const time = "2022-01-01T10:30:00.000Z";
  const roomId = "a1b2c3";
  const sender: User = {
    id: "123",
    name: "Some User",
  };

  it("generates an error response when given an invalid command", () => {
    const command: Command = {
      name: "invalidcommand",
      sender,
      roomId,
      time,
    };
    const response = processCommand(command);
    expect(response).toEqual({
      content: "Unrecognised command, type <b>/help</b> for further assistance",
      recipientId: sender.id,
      roomId,
      time,
    });
  });

  describe("/help", () => {
    it("generates a help response", () => {
      const command: Command = {
        name: "help",
        sender,
        roomId,
        time,
      };
      const response = processCommand(command);
      expect(response).toEqual({
        content: [
          "\n<p>Type to chat, or enter one of the following commands:</p>\n",
          "<b>/help</b>: list commands<br />\n",
        ].join(""),
        recipientId: sender.id,
        roomId,
        time,
      });
    });
  });
});
