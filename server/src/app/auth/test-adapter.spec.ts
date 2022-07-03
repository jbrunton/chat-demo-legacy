import { AdapterUser } from "next-auth/adapters";
import { JsonDB } from "node-json-db";
import { TestAdapter } from "./test-adapter";

describe("TestAdapter", () => {
  const testUser = {
    email: "test@example.com",
  };

  let db: JsonDB;

  beforeEach(() => {
    db = new JsonDB("test-db", false, false, "/");
  });

  describe("getUser", () => {
    it("returns a user when one exists", async () => {
      const adapter = TestAdapter(db);
      const user = await adapter.createUser(testUser);
      const user2 = await adapter.getUser(user.id);

      expect(user).toEqual(user2);
      expect(user).toEqual({
        id: user.id,
        ...testUser,
      });
    });

    it("returns null otherwise", async () => {
      const adapter = TestAdapter(db);
      const user = await adapter.getUser("not-a-user");
      expect(user).toBeNull();
    });
  });
});
