import { ResponseAdapter } from "@app/dependencies/requests-adapters";
import {
  EntityNotFoundError,
  InvalidArgumentError,
  UnauthorisedUser,
} from "@domain/entities/errors";
import { mock, MockProxy } from "jest-mock-extended";
import { defaultErrorHandler } from "./api";

describe("defaultErrorHandler", () => {
  let res: MockProxy<ResponseAdapter>;

  beforeEach(() => {
    res = mock<ResponseAdapter>();
  });

  it("handles UnauthorisedUser errors", () => {
    defaultErrorHandler(
      UnauthorisedUser.create("user-id", "rename", "MyResource"),
      res
    );
    expect(res.sendResponse).toHaveBeenCalledWith(401, {
      error: "User user-id is not authorised to perform rename on MyResource",
    });
  });

  it("handles EntityNotFoundErrors", () => {
    defaultErrorHandler(EntityNotFoundError.create("test-id", "MyEntity"), res);
    expect(res.sendResponse).toHaveBeenCalledWith(404, {
      error: "Could not find MyEntity (id=test-id)",
    });
  });

  it("handles InvalidArgumentError", () => {
    defaultErrorHandler(
      InvalidArgumentError.create({
        parameter: "param1",
        argument: "foo",
        expected: "bar",
      }),
      res
    );
    expect(res.sendResponse).toHaveBeenCalledWith(422, {
      error: "Invalid argument foo passed to param1, expected bar",
    });
  });
});
