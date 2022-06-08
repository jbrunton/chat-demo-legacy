import { getAppName, getDomainName, getEnvironment, getEnvironmentConfig } from "./config";

jest.mock('./random', () => {
  return {
    randomString: () => "a1b2c3d4"
  };
});

describe("getEnvironment", () => {
  it("returns 'production' for production", () => {
    expect(getEnvironment("production")).toEqual("production");
  });

  it("returns 'staging' for staging", () => {
    expect(getEnvironment("staging")).toEqual("staging");
  });

  it("returns 'development' for other stack names", () => {
    expect(getEnvironment("dev")).toEqual("development");
    expect(getEnvironment("foo-bar")).toEqual("development");
    expect(getEnvironment("deps-lib-123.x")).toEqual("development");
  });
});

describe("getAppName", () => {
  it("prepends chat-demo", () => {
    const stackName = "dev";
    expect(getAppName(stackName)).toEqual("chat-demo-dev");
  });

  it("truncates names greater than 32 chars long", () => {
    const stackName = "deps-upgrade-some-lib-3.x";
    expect(getAppName(stackName)).toEqual("chat-demo-deps-upgrade-some-lib-");
  });
});

describe("getDomainName", () => {
  it ("returns production domain when the environment is production", () => {
    expect(getDomainName("production", "production")).toEqual("chat-demo.jbrunton-do.com")
  });

  it ("returns staging domain when the environment is production", () => {
    expect(getDomainName("staging", "staging")).toEqual("chat-demo.staging.jbrunton-do.com")
  });

  it ("returns the dev domain when the stack name is dev", () => {
    expect(getDomainName("development", "dev")).toEqual("chat-demo.dev.jbrunton-do.com")
  });

  it ("returns a dev subdomain for other stacks", () => {
    expect(getDomainName("development", "my-stack")).toEqual("my-stack.chat-demo.dev.jbrunton-do.com")
  });
});

describe("getEnvironmentConfig", () => {
  it("returns a complete config object", () => {
    const inputs = {
      tag: "latest",
      stackName: "dev",
    };
    const config = getEnvironmentConfig(inputs);
    expect(config).toEqual({
      tag: "latest",
      stackName: "dev",
      appName: "chat-demo-dev",
      environment: "development",
      domain: "chat-demo.dev.jbrunton-do.com",
      publicUrl: "https://chat-demo.dev.jbrunton-do.com",
      specId: "chat-demo-dev/latest/a1b2c3d4",
    });
  });
});
