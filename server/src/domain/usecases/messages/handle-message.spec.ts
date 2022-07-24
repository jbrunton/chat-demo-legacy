import { Dispatcher } from "@domain/usecases/messages/dispatcher";
import { handleMessage, parseMessage } from "./handle-message";
import { mock, MockProxy } from "jest-mock-extended";
import { IncomingMessage, PublicMessage } from "@domain/entities/messages";
import { UserRepository } from "@domain/entities/user";
import { RoomRepository } from "@domain/entities/room";
import { Dependencies } from "../dependencies";
import { Command } from "@domain/entities/commands";

describe("parseMessage", () => {
  const time = "2022-01-01T10:30:00.000Z";
  const roomId = "a1b2c3";
  const sender = {
    id: "1234",
    name: "User_123",
  };

  it("parses commands with no arguments", () => {
    const incoming: IncomingMessage = {
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

  let userRepository: MockProxy<UserRepository>;
  let roomRepository: MockProxy<RoomRepository>;
  let deps: Dependencies;

  beforeEach(() => {
    dispatcher = mock<Dispatcher>();
    jest.useFakeTimers().setSystemTime(now);
    userRepository = mock<UserRepository>();
    roomRepository = mock<RoomRepository>();
    deps = {
      userRepository,
      roomRepository,
    };
  });

  it("dispatches public messages", async () => {
    const message: PublicMessage = {
      content: "Hello, World!",
      time: new Date().toISOString(),
      roomId: "123",
    };
    await handleMessage(message, dispatcher, deps);
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

    await handleMessage(command, dispatcher, deps);

    expect(dispatcher.sendPrivateMessage).toHaveBeenCalledWith({
      recipientId: sender.id,
      content: "Unrecognised command, type <b>/help</b> for further assistance",
      roomId: "123",
      time: "2022-02-02T21:22:23.234Z",
    });
  });
});
