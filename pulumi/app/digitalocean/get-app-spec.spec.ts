import { getAppSpec } from "./get-app-spec";
import { StackConfig } from "./usecases/stack/get-stack-config";

describe("getAppSpec", () => {
  it("generates an App Platform spec for the given stack configuration", () => {
    const config: StackConfig = {
      stackName: "test",
      appName: "chat-demo-test",
      tag: "latest",
      environment: "development",
      protect: false,
      domain: "test.chat-demo.dev.jbrunton-do.com",
      publicUrl: "https://test.chat-demo.dev.jbrunton-do.com",
      rootDomain: "jbrunton-do.com",
      specId: "chat-demo-test/latest/a1a1a1a1",
    };
    const spec = getAppSpec(config);
    expect(spec).toEqual({
      spec: {
        name: "chat-demo-test",
        region: "lon",
        domainNames: [
          {
            name: "test.chat-demo.dev.jbrunton-do.com",
            zone: "jbrunton-do.com",
            type: "PRIMARY",
          },
        ],
        services: [
          {
            name: "app",
            httpPort: 3000,
            image: {
              registry: "jbrunton",
              registryType: "DOCKER_HUB",
              repository: "chat-demo-app",
              tag: "latest",
            },
            envs: [
              {
                key: "NEXT_PUBLIC_DOMAIN",
                scope: "RUN_TIME",
                value: "https://test.chat-demo.dev.jbrunton-do.com",
              },
              {
                key: "TAG",
                scope: "RUN_TIME",
                value: "latest",
              },
              {
                key: "SPEC_ID",
                scope: "RUN_TIME",
                value: "chat-demo-test/latest/a1a1a1a1",
              },
              {
                key: "GOOGLE_CLIENT_ID",
                scope: "RUN_TIME",
                value: "test-google-client-id",
              },
              {
                key: "GOOGLE_CLIENT_SECRET",
                scope: "RUN_TIME",
                value: "test-google-client-secret",
              },
              {
                key: "NEXTAUTH_URL",
                scope: "RUN_TIME",
                value: "https://test.chat-demo.dev.jbrunton-do.com",
              },
              {
                key: "NEXTAUTH_SECRET",
                scope: "RUN_TIME",
                value: "test-next-auth-secret",
              },
            ],
            instanceCount: 1,
            instanceSizeSlug: "basic-xxs",
            routes: [
              {
                path: "/",
              },
            ],
          },
        ],
      },
    });
  });
});
