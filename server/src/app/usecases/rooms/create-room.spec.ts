import { User } from "@domain/entities/user";
import { Room } from "@domain/entities/room";
import { mockReqDependencies } from "@fixtures/dependencies";
import { pipe } from "fp-ts/lib/function";
import { stubAuth } from "@fixtures/auth";
import { stubCreateRoom } from "@fixtures/room";
import { stubRequest } from "@fixtures/requests";
import { createRoom } from "./create-room";
import { stubNameGenerator } from "@fixtures/name-generator";
import { withDeps } from "@domain/usecases/dependencies";

describe("createRoom", () => {
  const testUser: User = {
    id: "test-user",
    name: "Test User",
  };

  const newRoom: Room = {
    id: "test-room",
    name: "Test Room",
    ownerId: testUser.id,
  };

  it("creates and returns a new room", async () => {
    const generatedName = "Some Random Place";
    const deps = pipe(
      mockReqDependencies(),
      stubAuth(testUser),
      stubNameGenerator({ placeName: generatedName }),
      stubCreateRoom({ ownerId: testUser.id, name: generatedName }, newRoom),
      stubRequest({ method: "POST", query: {} })
    );

    await withDeps(deps).run(createRoom());

    expect(deps.res.sendResponse).toHaveBeenCalledWith(201, newRoom);
  });

  it("authenticates the user", async () => {
    const deps = pipe(
      mockReqDependencies(),
      stubRequest({ method: "POST", query: {} })
    );

    await withDeps(deps).run(createRoom());

    expect(deps.res.sendResponse).toHaveBeenCalledWith(401, {
      error: "User must be authenticated",
    });
  });
});
