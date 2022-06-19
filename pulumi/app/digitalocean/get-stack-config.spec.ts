import { getStackConfig } from "./get-stack-config";

describe("getStackConfig", () => {
  it("returns a stack config", () => {
    const config = getStackConfig({ stackName: "test", tag: "latest" });
    expect(config).toMatchObject({
      stackName: "test",
      appName: "chat-demo-test",
      domain: "test.chat-demo.dev.jbrunton-do.com"
    })
  })
});
