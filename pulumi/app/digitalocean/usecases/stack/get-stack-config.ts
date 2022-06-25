import { randomString } from "@common/random";
import * as entities from "@entities";
import * as usecases from "@usecases";

export type ApplicationConfig = entities.ApplicationConfig & {
  specId: string;
};

export type StackConfig = ApplicationConfig & entities.DomainConfig;

export const getStackConfig: entities.GetStackConfig<StackConfig> = (
  inputs: entities.ApplicationInputs
): StackConfig => {
  const appConfig = usecases.getApplicationConfig(inputs);
  const domainConfig = usecases.getDomainConfig(appConfig);
  const specId = getSpecId(appConfig);
  return {
    ...appConfig,
    ...domainConfig,
    specId,
  };
};

/**
 * There's a bug in the provider for App Platform in which provisioning hangs if the spec
 * hasn't changed. Hence, generate a unique ID each time we provision.
 */
const getSpecId = (config: entities.ApplicationConfig): string => {
  return `${config.appName}/${config.tag}/${randomString(4)}`;
};
