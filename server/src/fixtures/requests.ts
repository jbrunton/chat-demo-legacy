import { RequestAdapter } from "@app/dependencies/requests-adapters";
import { MockReqDependencies } from "./dependencies";

export const stubRequest =
  (
    params: Pick<RequestAdapter, "method" | "query"> & {
      body?: RequestAdapter["body"];
    }
  ) =>
  (deps: MockReqDependencies) => {
    const req: RequestAdapter = {
      ...{ body: undefined },
      ...params,
    };
    return { ...deps, req };
  };
