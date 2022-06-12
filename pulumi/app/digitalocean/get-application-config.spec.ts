import { getDOApplicationConfig } from "./get-application-config"

jest.mock('./random', () => {
  return {
    randomString: () => "a1b2c3d4"
  };
});

describe("getDOApplicationConfig", () => {
  it("adds a specId", () => {
    const config = getDOApplicationConfig({ stackName: "dev", tag: "latest" });
    expect(config).toMatchObject({
      specId: "chat-demo-dev/latest/a1b2c3d4",
    })
  })
})
