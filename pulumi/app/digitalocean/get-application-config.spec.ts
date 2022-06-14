import { getApplicationConfig } from "./get-application-config"

jest.mock('@common/random');

describe("getApplicationConfig", () => {
  it("adds a specId", () => {
    const config = getApplicationConfig({ stackName: "dev", tag: "latest" });
    expect(config).toMatchObject({
      specId: "chat-demo-dev/latest/a1a1a1a1",
    })
  })
})
