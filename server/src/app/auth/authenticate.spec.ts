import { User } from "@domain/entities/user";
import { Session } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { mockReqDependencies } from "@fixtures/dependencies";
import { authenticate } from "./authenticate";
import { UnauthorisedUser } from "@domain/entities/errors";
import { pipe } from "fp-ts/lib/function";
import { stubAdapterUser, stubSession } from "@fixtures/auth";
import { withDeps } from "@domain/usecases/dependencies";

describe("authenticate", () => {
  const testUser: User = {
    id: "123",
    name: "Test User",
  };

  const testAdapterUser: AdapterUser = {
    ...testUser,
    email: "test@example.com",
    emailVerified: new Date(),
  };

  const testSession: Session = {
    user: testUser,
    expires: new Date().toISOString(),
  };

  it("returns the authenticated user", async () => {
    const deps = pipe(
      mockReqDependencies(),
      stubSession(testSession),
      stubAdapterUser(testUser.id, testAdapterUser)
    );
    const user = await withDeps(deps).run(authenticate());
    expect(user).toEqual(testUser);
  });

  it("errors if the request is not authenticated", async () => {
    const deps = pipe(
      mockReqDependencies(),
      stubSession(null),
      stubAdapterUser(testUser.id, testAdapterUser)
    );
    await expect(() => withDeps(deps).run(authenticate())).rejects.toEqual(
      new UnauthorisedUser("User must be authenticated")
    );
  });

  it("errors if the user does not exist", async () => {
    const deps = pipe(
      mockReqDependencies(),
      stubSession(testSession),
      stubAdapterUser(testUser.id, null)
    );
    await expect(() => withDeps(deps).run(authenticate())).rejects.toEqual(
      new UnauthorisedUser("User does not exist")
    );
  });
});
