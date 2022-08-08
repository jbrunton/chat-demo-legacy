import { withDeps } from "@app/dependencies";
import { User } from "@domain/entities/user";
import { MockProxy } from "jest-mock-extended";
import { Session } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { mockReqDependencies } from "@fixtures/dependencies";
import { authenticate, AuthenticateDeps } from "./authenticate";
import { UnauthorisedUser } from "@domain/entities/errors";

type MockAuthenticateDeps = {
  [K in keyof AuthenticateDeps]: MockProxy<AuthenticateDeps[K]>;
};

describe("authenticate", () => {
  let dependencies: MockAuthenticateDeps;

  const testUser: User = {
    id: "123",
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

  beforeEach(() => {
    dependencies = mockReqDependencies();
  });

  const mockSession = ({
    session,
    user,
  }: {
    session: Session | null;
    user: AdapterUser | null;
  }) => {
    const { sessionRepository, adapter } = dependencies;
    sessionRepository.getSession.mockResolvedValue(session);
    adapter.getUser.calledWith(testUser.id).mockResolvedValue(user);
  };

  it("returns the authenticated user", async () => {
    mockSession({
      session: testSession,
      user: testAdapterUser,
    });
    const user = await withDeps(dependencies).run(authenticate());
    expect(user).toEqual(testUser);
  });

  it("errors if the request is not authenticated", async () => {
    mockSession({
      session: null,
      user: testAdapterUser,
    });
    await expect(() =>
      withDeps(dependencies).run(authenticate())
    ).rejects.toEqual(new UnauthorisedUser("User must be authenticated"));
  });

  it("errors if the user does not exist", async () => {
    mockSession({
      session: testSession,
      user: null,
    });
    await expect(() =>
      withDeps(dependencies).run(authenticate())
    ).rejects.toEqual(new UnauthorisedUser("User does not exist"));
  });
});
