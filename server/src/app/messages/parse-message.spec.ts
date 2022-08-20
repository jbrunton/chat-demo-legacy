import { RequestAdapter } from "@app/dependencies/requests-adapters";
import { MessageRequestBody } from "./handle-message";
import { parseMessage } from "./parse-message";

describe("parseMessage", () => {
  const time = "2022-01-01T10:30:00.000Z";
  const roomId = "a1b2c3";
  const sender = {
    id: "1234",
    name: "User_123",
  };

  const query = { id: roomId };

  const makeRequest = (body: MessageRequestBody): RequestAdapter => {
    return {
      method: "POST",
      query,
      body,
      user: sender,
    };
  };

  it("parses commands with no arguments", () => {
    const body: MessageRequestBody = {
      content: "/list",
      time,
    };
    const response = parseMessage(makeRequest(body));
    expect(response).toEqual({
      name: "list",
      args: [],
      roomId,
      sender,
      time,
    });
  });

  it("parses commands with arguments", () => {
    const body: MessageRequestBody = {
      content: "/rename user Test User",
      time,
    };
    const response = parseMessage(makeRequest(body));
    expect(response).toEqual({
      name: "rename",
      args: ["user", "Test", "User"],
      roomId,
      sender,
      time,
    });
  });

  it("parses messages", () => {
    const body: MessageRequestBody = {
      content: "Hello, world!",
      time,
    };

    const response = parseMessage(makeRequest(body));

    expect(response).toEqual({
      roomId,
      sender,
      content: "Hello, world!",
      time,
    });
  });
});
