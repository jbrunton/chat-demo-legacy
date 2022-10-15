import { mock, MockProxy } from "jest-mock-extended";
import { QuickDb } from "./quick-db";
import { QuickDbAdapter, QuickDbStore } from "./types";

type User = { id: string; name: string };
type TestSchema = { users: User };

describe("QuickDb", () => {
  let adapter: MockProxy<QuickDbAdapter<TestSchema>>;
  let testUserOne: User;
  let testUserTwo: User;

  const createDb = (initSchema?: QuickDbStore<TestSchema>) => {
    return new QuickDb({
      adapter,
      initStore: () => initSchema ?? { users: [] },
    });
  };

  beforeEach(() => {
    adapter = mock<QuickDbAdapter<TestSchema>>();
    testUserOne = { id: "1", name: "User One" };
    testUserTwo = { id: "2", name: "User Two" };
  });

  describe("constructor", () => {
    it("defaults to the initial collection", () => {
      const initialCollection = [testUserOne];
      adapter.readStore.mockReturnValue({ users: initialCollection });

      const db = createDb();

      expect(db.get("users").value()).toEqual(initialCollection);
    });

    it("reads the store from the adapter if it exists", () => {
      adapter.readStore.mockReturnValue({
        users: [testUserOne],
      });
      const db = createDb();
      expect(db.get("users").value()).toEqual([testUserOne]);
    });

    it("deep clones the default values", () => {
      adapter.readStore.mockReturnValue(null);
      const users = [testUserOne];

      const db = createDb({ users });
      db.get("users").first().assign({ name: "Updated User" }).commit();

      expect(db.get("users").value()).toEqual([
        { id: "1", name: "Updated User" },
      ]);
      expect(users).toEqual([testUserOne]);
    });
  });

  describe("get", () => {
    it("returns a lodash chain", () => {
      const db = createDb();
      db.set("users", [testUserOne, testUserTwo]);

      const result = db.get("users");

      expect(result.find({ id: "1" }).value()).toEqual(testUserOne);
    });

    it("includes a commit method", () => {
      const db = createDb();
      const collection = [testUserOne, testUserTwo];
      db.set("users", collection);

      const result = db.get("users");

      // show we can call commit...
      result.find({ id: "2" }).assign({ name: "Updated User" }).commit();
      // ...and that commit() updates the underlying value
      expect(db.get("users").value()).toEqual([
        { id: "1", name: "User One" },
        { id: "2", name: "Updated User" },
      ]);
    });
  });

  describe("write", () => {
    it("writes the collection to the adapter", () => {
      const collection = [testUserOne, testUserTwo];
      const db = createDb();
      db.set("users", collection);

      db.write();

      expect(adapter.writeStore).toHaveBeenCalledWith({ users: collection });
    });
  });
});
