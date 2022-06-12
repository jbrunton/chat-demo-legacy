import { getDomainConfig } from "./get-domain-config";

describe("getDomainConfig", () => {
  it("returns production domain when the environment is production", () => {
    const config = getDomainConfig({ environment: "production", appName: "production" });
    expect(config).toEqual({
      domain: "chat-demo.jbrunton-do.com",
      rootDomain: "jbrunton-do.com",
      publicUrl: "https://chat-demo.jbrunton-do.com",
    });
  });

  it("returns staging domain when the environment is production", () => {
    const config = getDomainConfig({ environment: "staging", appName: "staging" });
    expect(config).toEqual({
      domain: "chat-demo.staging.jbrunton-do.com",
      rootDomain: "jbrunton-do.com",
      publicUrl: "https://chat-demo.staging.jbrunton-do.com",
    });
  });

  it("returns a dev domain when the environment is development", () => {
    const config = getDomainConfig({ environment: "development", appName: "my-app" });
    expect(config).toEqual({
      domain: "my-app.chat-demo.dev.jbrunton-do.com",
      rootDomain: "jbrunton-do.com",
      publicUrl: "https://my-app.chat-demo.dev.jbrunton-do.com",
    });
  });
});
