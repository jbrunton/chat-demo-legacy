import { getApplicationConfig } from "./get-application-config";

describe("getApplicationConfig", () => {
  it("returns the application configuration", () => {
    const inputs = {
      tag: "latest",
      stackName: "dev",
    };
    const config = getApplicationConfig(inputs);
    expect(config).toEqual({
      tag: "latest",
      stackName: "dev",
      appName: "chat-demo-dev",
      environment: "development",
      protect: false,
    });
  });

  describe(".protect", () => {
    const tag = "latest";

    it("returns true for production", () => {
      const config = getApplicationConfig({ stackName: "production", tag })
      expect(config.protect).toEqual(true);
    });
  
    it("returns false for staging", () => {
      const config = getApplicationConfig({ stackName: "staging", tag })
      expect(config.protect).toEqual(false);
    });
  
    it("returns false for other stack names", () => {
      const config = getApplicationConfig({ stackName: "dev", tag });
      expect(config.protect).toEqual(false);
    });
  });

  describe(".environment", () => {
    const tag = "latest";

    it("returns 'production' for production", () => {
      const config = getApplicationConfig({ stackName: "production", tag })
      expect(config.environment).toEqual("production");
    });
  
    it("returns 'staging' for staging", () => {
      const config = getApplicationConfig({ stackName: "staging", tag })
      expect(config.environment).toEqual("staging");
    });
  
    it("returns 'development' for other stack names", () => {
      expect(getApplicationConfig({ stackName: "dev", tag }).environment).toEqual("development");
      expect(getApplicationConfig({ stackName: "foo-bar", tag }).environment).toEqual("development");
      expect(getApplicationConfig({ stackName: "deps-lib-123.x", tag }).environment).toEqual("development");
    });
  });
  
  describe(".appName", () => {
    const tag = "latest";
    it("prepends chat-demo", () => {
      const config = getApplicationConfig({ stackName: "dev", tag });
      expect(config.appName).toEqual("chat-demo-dev");
    });
  
    it("truncates names greater than 32 chars long", () => {
      const config = getApplicationConfig({ stackName: "deps-some-long-name-lib-3.x", tag });
      expect(config.appName).toEqual("chat-demo-deps-some-long-name-li");
    });
  
    it("removes illegal characters", () => {
      const config = getApplicationConfig({ stackName: "deps-some-lib-3.x", tag });
      expect(config.appName).toEqual("chat-demo-deps-some-lib-3x");
    });
  });
});
