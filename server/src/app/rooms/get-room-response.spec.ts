import { User } from "@domain/entities/user";
import { Room } from "@domain/entities/room";
import { withDeps } from "@app/dependencies";
import { AdapterUser } from "next-auth/adapters";
import {
  mockReqDependencies,
  MockReqDependencies,
} from "@fixtures/dependencies";
import { Session } from "next-auth";
import { getRoomResponse } from "./get-room-response";
import { Message } from "@domain/entities/messages";

describe("getRoomResponse", () => {
  const now = new Date("2022-02-02T21:22:23.234Z");

  const testUser: User = {
    id: "test-user",
    name: "Test User",
  };

  const testAdapterUser: AdapterUser = {
    ...testUser,
    emailVerified: new Date(),
  };

  const testSession: Session = {
    user: testUser,
    expires: new Date().toISOString(),
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

  const query = { id: testRoom.id };

  let deps: MockReqDependencies;

  const stubRequest = () => {
    deps.req = {
      query,
      method: "GET",
      body: undefined,
    };
  };

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
    deps = mockReqDependencies();

    deps.sessionRepository.getSession.mockResolvedValue(testSession);
    deps.roomRepository.getRoom
      .calledWith(testRoom.id)
      .mockResolvedValue(testRoom);
    deps.roomRepository.getMessageHistory
      .calledWith(testRoom.id)
      .mockResolvedValue(testMessages);
    deps.adapter.getUser
      .calledWith(testUser.id)
      .mockResolvedValue(testAdapterUser);
  });

  it("responds with the room details", async () => {
    stubRequest();

    await withDeps(deps).run(getRoomResponse());

    expect(deps.res.sendResponse).toHaveBeenCalledWith(201, {
      room: testRoom,
      messages: testMessages,
    });
  });
});
