import * as RT from "fp-ts/ReaderTask";
import { MockReqDependencies } from "./dependencies";

export const fakeDispatcher =
  () =>
  ({ dispatcher, ...deps }: MockReqDependencies) => {
    dispatcher.sendMessage.mockImplementation((message) => RT.of(message));
    return { dispatcher, ...deps };
  };
