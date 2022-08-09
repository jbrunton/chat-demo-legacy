import { User } from "@domain/entities/user";
import { MembershipStatus, Room } from "@domain/entities/room";
import { mockReqDependencies } from "@fixtures/dependencies";
import { getRoomResponse } from "./get-room";
import { Message } from "@domain/entities/messages";
import { pipe } from "fp-ts/lib/function";
import { stubAuth } from "@fixtures/auth";
import { stubMembershipStatus, stubRoom } from "@fixtures/room";
import { stubRequest } from "@fixtures/requests";
import { withDeps } from "@domain/usecases/dependencies";

describe("getRoom", () => {
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

  it("responds with the room details", async () => {
    const deps = pipe(
      mockReqDependencies(),
      stubAuth(testUser),
      stubRoom(testRoom, testMessages),
      stubMembershipStatus(
        { roomId: testRoom.id, userId: testUser.id },
        MembershipStatus.Joined
      ),
      stubRequest({ method: "GET", query: { id: testRoom.id } })
    );

    await withDeps(deps).run(getRoomResponse());

    expect(deps.res.sendResponse).toHaveBeenCalledWith(201, {
      room: testRoom,
      messages: testMessages,
      membershipStatus: MembershipStatus.Joined,
    });
  });

  it("responds with a 404 if the room does not exist", async () => {
    const deps = pipe(
      mockReqDependencies(),
      stubAuth(testUser),
      stubRequest({ method: "GET", query: { id: testRoom.id } })
    );

    await withDeps(deps).run(getRoomResponse());

    expect(deps.res.sendResponse).toHaveBeenCalledWith(404, {
      error: "Could not find room (id=test-room)",
    });
  });

  it("authenticates the user", async () => {
    const deps = pipe(
      mockReqDependencies(),
      stubRequest({ method: "GET", query: { id: testRoom.id } })
    );

    await withDeps(deps).run(getRoomResponse());

    expect(deps.res.sendResponse).toHaveBeenCalledWith(401, {
      error: "User must be authenticated",
    });
  });
});
