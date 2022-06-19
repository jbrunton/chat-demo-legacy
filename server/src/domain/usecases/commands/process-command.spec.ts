import { Command } from "@domain/entities";
import { processCommand } from "./process-command";

describe("#processCommand", () => {
  const time = "2022-01-01T10:30:00.000Z";
  const roomId = "a1b2c3";

  it("generates an error response when given an invalid command", () => {
    const command: Command = {
      name: "invalidcommand",
      senderId: "1234",
      roomId,
      time,
    };
    const response = processCommand(command);
    expect(response).toEqual({
      content: "Unrecognised command, type <b>/help</b> for further assistance",
      recipientId: "1234",
      roomId,
      time,
    });
  });

  describe("/help", () => {
    it("generates a help response", () => {
      const command: Command = {
        name: "help",
        senderId: "1234",
        roomId,
        time,
      };
      const response = processCommand(command);
      expect(response).toEqual({
        content: [
          "\n<p>Type to chat, or enter one of the following commands:</p>\n",
          "<b>/help</b>: list commands<br />\n",
        ].join(""),
        recipientId: "1234",
        roomId,
        time,
      });
    });
  });
});
