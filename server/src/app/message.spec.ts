import { IncomingMessage, parseMessage } from "./message";

describe("parseMessage", () => {
  const time = "2022-01-01T10:30:00.000Z";
  const roomId = "a1b2c3";
  const senderId = "1234";
  const user = "User_123";

  it("parses commands", () => {
    const incoming: IncomingMessage = {
      user,
      roomId,
      senderId,
      content: "/list",
      time,
    };
    const response = parseMessage(incoming);
    expect(response).toEqual({
      name: "list",
      roomId,
      senderId,
      time,
    });
  });

  it("parses messages", () => {
    const incoming: IncomingMessage = {
      user,
      roomId,
      senderId,
      content: "Hello, world!",
      time,
    };
    const response = parseMessage(incoming);
    expect(response).toEqual({
      roomId,
      senderId,
      content: "Hello, world!",
      time,
    });
  });
});
