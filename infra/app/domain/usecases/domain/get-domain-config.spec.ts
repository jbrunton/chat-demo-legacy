import { getDomainConfig } from "./get-domain-config";

describe("getDomainConfig", () => {
  it("returns production domain when the environment is production", () => {
    const config = getDomainConfig({
      environment: "production",
      stackName: "production",
      rootDomain: "jbrunton-aws.com",
    });
    expect(config).toEqual({
      domain: "chat-demo.jbrunton-aws.com",
      rootDomain: "jbrunton-aws.com",
      publicUrl: "https://chat-demo.jbrunton-aws.com",
    });
  });

  it("returns staging domain when the environment is production", () => {
    const config = getDomainConfig({
      environment: "staging",
      stackName: "staging",
      rootDomain: "jbrunton-aws.com",
    });
    expect(config).toEqual({
      domain: "chat-demo.staging.jbrunton-aws.com",
      rootDomain: "jbrunton-aws.com",
      publicUrl: "https://chat-demo.staging.jbrunton-aws.com",
    });
  });

  it("returns a dev domain when the environment is development", () => {
    const config = getDomainConfig({
      environment: "development",
      stackName: "test",
      rootDomain: "jbrunton-aws.com",
    });
    expect(config).toEqual({
      domain: "chat-demo-test.dev.jbrunton-aws.com",
      rootDomain: "jbrunton-aws.com",
      publicUrl: "https://chat-demo-test.dev.jbrunton-aws.com",
    });
  });
});
