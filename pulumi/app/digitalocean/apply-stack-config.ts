import { App } from "@pulumi/digitalocean";
import { ApplyStackConfig } from "@entities";
import { StackConfig } from "./usecases/stack/get-stack-config";
import { getAppSpec } from "./get-app-spec";

export const applyStackConfig: ApplyStackConfig<StackConfig> = (
  config: StackConfig
) => {
  const appSpec = getAppSpec(config);
  new App(config.appName, appSpec, {
    protect: config.protect,
  });
};
