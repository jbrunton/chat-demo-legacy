import { getDomainConfig } from "./get-domain-config";

describe("getDomainConfig", () => {
  it("returns production domain when the environment is production", () => {
    const config = getDomainConfig({ environment: "production", stackName: "production" });
    expect(config).toEqual({
      domain: "chat-demo.jbrunton-do.com",
      rootDomain: "jbrunton-do.com",
      publicUrl: "https://chat-demo.jbrunton-do.com",
    });
  });

  it("returns staging domain when the environment is production", () => {
    const config = getDomainConfig({ environment: "staging", stackName: "staging" });
    expect(config).toEqual({
      domain: "chat-demo.staging.jbrunton-do.com",
      rootDomain: "jbrunton-do.com",
      publicUrl: "https://chat-demo.staging.jbrunton-do.com",
    });
  });

  it("returns a dev domain when the environment is development", () => {
    const config = getDomainConfig({ environment: "development", stackName: "test" });
    expect(config).toEqual({
      domain: "test.chat-demo.dev.jbrunton-do.com",
      rootDomain: "jbrunton-do.com",
      publicUrl: "https://test.chat-demo.dev.jbrunton-do.com",
    });
  });
});
