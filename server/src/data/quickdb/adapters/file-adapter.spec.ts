import * as fs from "fs";
import { mock, MockProxy } from "jest-mock-extended";
import { QuickDbFileAdapter } from "./file-adapter";

type FsType = Pick<typeof fs, "readFileSync" | "writeFileSync">;
type FsProxy = MockProxy<FsType>;

let mockFs: FsProxy;

jest.mock("fs", () => {
  mockFs = mock<FsType>();
  return mockFs;
});

describe("QuickDbFileAdapter", () => {
  let readFileSync: FsProxy["readFileSync"];
  let writeFileSync: FsProxy["writeFileSync"];

  beforeEach(() => {
    readFileSync = mockFs.readFileSync;
    writeFileSync = mockFs.writeFileSync;
  });

  it("reads the store from a file", () => {
    const adapter = new QuickDbFileAdapter("test.json");
    readFileSync.calledWith(`${process.cwd()}/test.json`).mockReturnValue(`
    {
      "users": [{ "id": 1, "name": "Test User" }]
    }`);

    const store = adapter.readStore();

    expect(store).toEqual({
      users: [{ id: 1, name: "Test User" }],
    });
  });

  it("writes the store to a file", () => {
    const adapter = new QuickDbFileAdapter("test.json");
    const store = {
      users: [{ id: 1, name: "Test User" }],
    };

    adapter.writeStore(store);

    const expectedPath = `${process.cwd()}/test.json`;
    expect(writeFileSync).toHaveBeenCalledWith(
      expectedPath,
      JSON.stringify(store)
    );
  });
});
