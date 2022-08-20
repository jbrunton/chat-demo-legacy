import { User } from "@domain/entities/user";
import { Room } from "@domain/entities/room";
import { withDeps } from "@app/dependencies";
import { mockReqDependencies } from "@fixtures/dependencies";
import { getRoomResponse } from "./get-room-response";
import { Message } from "@domain/entities/messages";
import { pipe } from "fp-ts/lib/function";
import { stubAuth } from "@fixtures/auth";
import { stubRoom } from "@fixtures/room";
import { stubRequest } from "@fixtures/requests";

describe("getRoomResponse", () => {
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

  const testMessages: Message[] = [
    {
      roomId: testRoom.id,
      content: "Hello, World!",
      time: now.toISOString(),
      sender: testUser,
    },
  ];

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
  });

  it("responds with the room details", async () => {
    const deps = pipe(
      mockReqDependencies(),
      stubAuth(testUser),
      stubRoom(testRoom, testMessages),
      stubRequest({ method: "GET", query: { id: testRoom.id } })
    );

    await withDeps(deps).run(getRoomResponse());

    expect(deps.res.sendResponse).toHaveBeenCalledWith(201, {
      room: testRoom,
      messages: testMessages,
    });
  });
});
