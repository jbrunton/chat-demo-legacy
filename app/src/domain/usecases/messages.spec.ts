import { Message } from "src/domain/entities";
import { generateResponse } from "./messages";

describe("#generateResponse", () => {
  const timestamp = "2022-01-01T10:30:00.000Z";
  const roomId = "a1b2c3";

  it("generates a public message to broadcast chats", () => {
    const message: Message = {
      content: "Hello!",
      senderId: "1234",
      roomId,
      timestamp,
    };
    const response = generateResponse(message);
    expect(response).toEqual({
      content: "Hello!",
      senderId: "1234",
      roomId,
      timestamp,
    });
  });

  it("generates a private error response when given an invalid command", () => {
    const message: Message = {
      content: "/invalidcommand",
      senderId: "1234",
      roomId,
      timestamp,
    };
    const response = generateResponse(message);
    expect(response).toEqual({
      content: "Unrecognised command, type <b>/help</b> for further assistance",
      recipientId: "1234",
      roomId,
      timestamp,
    });
  });

  describe("/help", () => {
    it("generates a help response", () => {
      const message: Message = {
        content: "/help",
        senderId: "1234",
        roomId,
        timestamp,
      };
      const response = generateResponse(message);
      expect(response).toEqual({
        content: [
          "\n<p>Type to chat, or enter one of the following commands:</p>\n",
          "<b>/help</b>: list commands<br />\n",
        ].join(""),
        recipientId: "1234",
        roomId,
        timestamp,
      });
    });
  });
});
