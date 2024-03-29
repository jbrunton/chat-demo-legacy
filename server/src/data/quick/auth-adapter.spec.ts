import { Account } from "next-auth";
import { Adapter, AdapterUser } from "next-auth/adapters";
import { QuickDbAuthAdapter } from "./auth-adapter";
import { AuthDB } from "./auth-db";

describe("FsAdapter", () => {
  const testUserEmail = "test@example.com";

  const testUserProps = {
    email: testUserEmail,
    emailVerified: null,
  };

  const testUser: AdapterUser = {
    id: "123",
    ...testUserProps,
  };

  const testAccount: Account = {
    provider: "google",
    type: "oauth",
    providerAccountId: "12345",
    userId: testUser.id,
  };

  let adapter: Adapter;
  let db: AuthDB;

  beforeEach(() => {
    db = AuthDB.createMemoryDB();
    adapter = new QuickDbAuthAdapter(db);
    db.set("users", [testUser]);
    db.set("accounts", [testAccount]);
    db.write();
  });

  describe("createUser", () => {
    it("creates a new user", async () => {
      const user = await adapter.createUser(testUserProps);
      const newUser = db.users.find({ id: user.id }).value();
      expect(user).toEqual(newUser);
      expect(user).toMatchObject(testUserProps);
    });
  });

  describe("getUser", () => {
    it("returns a user when one exists", async () => {
      const user = await adapter.getUser(testUser.id);
      expect(user).toEqual(testUser);
    });

    it("returns null otherwise", async () => {
      const user = await adapter.getUser("not-a-user");
      expect(user).toBeNull();
    });
  });

  describe("getUserByEmail", () => {
    it("returns a user when one exists", async () => {
      const user = await adapter.getUserByEmail(testUserEmail);
      expect(user).toEqual(testUser);
    });

    it("returns null otherwise", async () => {
      const user = await adapter.getUserByEmail("not-a-user@example.com");
      expect(user).toBeNull();
    });
  });

  describe("getUserByAccount", () => {
    it("returns the user and account", async () => {
      const user = await adapter.getUserByAccount({
        provider: "google",
        providerAccountId: testAccount.providerAccountId,
      });
      expect(user).toEqual(testUser);
    });
  });

  describe("updateUser", () => {
    it("updates the user with new information", async () => {
      const newEmail = "new-email@example.com";
      const updatedUser = await adapter.updateUser({
        id: testUser.id,
        email: newEmail,
      });
      const user = await adapter.getUser(testUser.id);

      expect(user).toEqual(updatedUser);
      expect(updatedUser).toEqual({
        ...testUser,
        email: newEmail,
      });
    });
  });
});
