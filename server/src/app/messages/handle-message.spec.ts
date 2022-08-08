import { Dispatcher } from "@domain/usecases/messages/dispatcher";
import { handleMessage, MessageRequestBody } from "./handle-message";
import { MockProxy } from "jest-mock-extended";
import { User } from "@domain/entities/user";
import { Room } from "@domain/entities/room";
import { withDeps } from "@app/dependencies";
import { AdapterUser } from "next-auth/adapters";
import {
  mockReqDependencies,
  MockReqDependencies,
} from "@fixtures/dependencies";
import { Session } from "next-auth";

describe("handleMessage", () => {
  let dispatcher: MockProxy<Dispatcher>;
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

  const query = { id: testRoom.id };

  let deps: MockReqDependencies;

  const stubBody = (body: MessageRequestBody) => {
    deps.req = {
      query,
      method: "POST",
      body,
    };
  };

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
    deps = mockReqDependencies();
    dispatcher = deps.dispatcher;

    deps.sessionRepository.getSession.mockResolvedValue(testSession);
    deps.roomRepository.getRoom
      .calledWith(testRoom.id)
      .mockResolvedValue(testRoom);
    deps.adapter.getUser
      .calledWith(testUser.id)
      .mockResolvedValue(testAdapterUser);
  });

  it("dispatches public messages", async () => {
    const body: MessageRequestBody = {
      content: "Hello, World!",
      time: new Date().toISOString(),
    };
    stubBody(body);

    await withDeps(deps).run(handleMessage());

    expect(dispatcher.sendPublicMessage).toHaveBeenCalledWith({
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
    stubBody(body);

    await withDeps(deps).run(handleMessage());

    expect(dispatcher.sendPrivateMessage).toHaveBeenCalledWith({
      recipientId: testUser.id,
      content: "Unrecognised command, type <b>/help</b> for further assistance",
      roomId: testRoom.id,
      time: "2022-02-02T21:22:23.234Z",
    });
  });
});
