import { getStackConfig } from "./get-stack-config";

jest.mock("@common/random");

describe("getStackConfig", () => {
  it("returns a stack config", () => {
    const config = getStackConfig({ stackName: "test", tag: "latest" });
    expect(config).toEqual({
      stackName: "test",
      appName: "chat-demo-test",
      tag: "latest",
      environment: "development",
      protect: false,
      specId: "chat-demo-test/latest/a1a1a1a1",
      domain: "test.chat-demo.dev.jbrunton-do.com",
      rootDomain: "jbrunton-do.com",
      publicUrl: "https://test.chat-demo.dev.jbrunton-do.com",
    });
  });
});
