import { Command, PublicMessage, User } from "@domain/entities";
import { Dispatcher } from "@domain/usecases/messages/dispatcher";
import { handleMessage, parseMessage } from "./message";
import { mock, MockProxy } from "jest-mock-extended";

describe("parseMessage", () => {
  const time = "2022-01-01T10:30:00.000Z";
  const roomId = "a1b2c3";
  const sender = {
    id: "1234",
    name: "User_123",
  };

  it("parses commands with no arguments", () => {
    const incoming: PublicMessage = {
      sender,
      roomId,
      content: "/list",
      time,
    };
    const response = parseMessage(incoming, sender);
    expect(response).toEqual({
      name: "list",
      args: [],
      roomId,
      sender,
      time,
    });
  });

  it("parses commands with arguments", () => {
    const incoming: PublicMessage = {
      sender,
      roomId,
      content: "/rename user Test User",
      time,
    };
    const response = parseMessage(incoming, sender);
    expect(response).toEqual({
      name: "rename",
      args: ["user", "Test", "User"],
      roomId,
      sender,
      time,
    });
  });

  it("parses messages", () => {
    const incoming: PublicMessage = {
      roomId,
      content: "Hello, world!",
      time,
    };
    const response = parseMessage(incoming, sender);
    expect(response).toEqual({
      roomId,
      sender,
      content: "Hello, world!",
      time,
    });
  });
});

describe("handleMessage", () => {
  let dispatcher: MockProxy<Dispatcher>;
  const now = new Date("2022-02-02T21:22:23.234Z");

  beforeEach(() => {
    dispatcher = mock<Dispatcher>();
    jest.useFakeTimers().setSystemTime(now);
  });

  it("dispatches public messages", () => {
    const message: PublicMessage = {
      content: "Hello, World!",
      time: new Date().toISOString(),
      roomId: "123",
    };
    handleMessage(message, dispatcher);
    expect(dispatcher.sendPublicMessage).toHaveBeenCalledWith(message);
  });

  it("dispatches commands", async () => {
    const sender = {
      name: "Some User",
      id: "456",
    };
    const command: Command = {
      name: "not-a-command",
      args: [],
      time: new Date().toISOString(),
      roomId: "123",
      sender,
    };

    await handleMessage(command, dispatcher);

    expect(dispatcher.sendPrivateMessage).toHaveBeenCalledWith({
      recipientId: sender.id,
      content: "Unrecognised command, type <b>/help</b> for further assistance",
      roomId: "123",
      time: "2022-02-02T21:22:23.234Z",
    });
  });
});
