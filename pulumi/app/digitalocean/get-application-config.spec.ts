import { getApplicationConfig } from "./get-application-config"

jest.mock('./random', () => {
  return {
    randomString: () => "a1b2c3d4"
  };
});

describe("getApplicationConfig", () => {
  it("adds a specId", () => {
    const config = getApplicationConfig({ stackName: "dev", tag: "latest" });
    expect(config).toMatchObject({
      specId: "chat-demo-dev/latest/a1b2c3d4",
    })
  })
})
