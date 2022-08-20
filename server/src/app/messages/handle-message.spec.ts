import { handleMessage, MessageRequestBody } from "./handle-message";
import { User } from "@domain/entities/user";
import { Room } from "@domain/entities/room";
import { withDeps } from "@app/dependencies";
import { mockReqDependencies } from "@fixtures/dependencies";
import { pipe } from "fp-ts/lib/function";
import { stubRequest } from "@fixtures/requests";
import { stubAuth } from "@fixtures/auth";
import { stubRoom } from "@fixtures/room";

describe("handleMessage", () => {
  const now = new Date("2022-02-02T21:22:23.234Z");

  const testUser: User = {
    id: "test-user",
    name: "Test User",
  };

  const testRoom: Room = {
    id: "test-room",
    name: "Test Room",
    ownerId: testUser.id,
  };

  const query = { id: testRoom.id };

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
  });

  it("dispatches public messages", async () => {
    const body: MessageRequestBody = {
      content: "Hello, World!",
      time: new Date().toISOString(),
    };
    const deps = pipe(
      mockReqDependencies(),
      stubRequest({ method: "POST", query, body }),
      stubAuth(testUser),
      stubRoom(testRoom)
    );

    await withDeps(deps).run(handleMessage());

    expect(deps.dispatcher.sendPublicMessage).toHaveBeenCalledWith({
      ...body,
      roomId: testRoom.id,
      sender: testUser,
    });
  });

  it("dispatches commands", async () => {
    const body: MessageRequestBody = {
      content: "/not-a-command",
      time: new Date().toISOString(),
    };
    const deps = pipe(
      mockReqDependencies(),
      stubRequest({ method: "POST", query, body }),
      stubAuth(testUser),
      stubRoom(testRoom)
    );

    await withDeps(deps).run(handleMessage());

    expect(deps.dispatcher.sendPrivateMessage).toHaveBeenCalledWith({
      recipientId: testUser.id,
      content: "Unrecognised command, type <b>/help</b> for further assistance",
      roomId: testRoom.id,
      time: "2022-02-02T21:22:23.234Z",
    });
  });
});