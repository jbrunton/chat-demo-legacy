import { StackSummary } from "@pulumi/pulumi/automation";
import { mock, MockProxy } from "jest-mock-extended";
import { cleanupLegacyStacks, StackCleaner } from "./cleanup-legacy-stacks";
import { makeStack } from "./get-legacy-stacks.spec";

describe("cleanupLegacyStacks", () => {
  let cleaner: MockProxy<StackCleaner>;
  let log: jest.SpyInstance<void, Parameters<typeof console["log"]>[0]>;

  beforeEach(() => {
    cleaner = mock<StackCleaner>();
    log = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    log.mockReset();
  });

  it("removes empty stacks", async () => {
    const stacks: StackSummary[] = [
      {
        ...makeStack("empty-stack"),
        resourceCount: 0,
      },
    ];

    await cleanupLegacyStacks(stacks, cleaner);

    expect(cleaner.removeStack).toHaveBeenCalledWith("empty-stack");
    expect(cleaner.destroyStack).not.toHaveBeenCalled();

    expect(log).toHaveBeenCalledWith("Found 1 legacy dev stack(s)");
    expect(log).toHaveBeenCalledWith("Removed legacy stack: empty-stack");
  });

  it("destroys non-empty stacks", async () => {
    const stacks: StackSummary[] = [
      {
        ...makeStack("non-empty-stack"),
        resourceCount: 1,
      },
    ];

    await cleanupLegacyStacks(stacks, cleaner);

    expect(cleaner.destroyStack).toHaveBeenCalledWith("non-empty-stack");
    expect(cleaner.removeStack).toHaveBeenCalledWith("non-empty-stack");

    expect(log).toHaveBeenCalledWith("Found 1 legacy dev stack(s)");
    expect(log).toHaveBeenCalledWith("Destroyed legacy stack: non-empty-stack");
    expect(log).toHaveBeenCalledWith("Removed legacy stack: non-empty-stack");
  });
});
