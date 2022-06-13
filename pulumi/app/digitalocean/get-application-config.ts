import * as entities from "@entities";
import * as usecases from "@usecases";
import { randomString } from "./random";

export type ApplicationConfig = entities.ApplicationConfig & {
  specId: string;
}

export const getApplicationConfig = (inputs: entities.ApplicationInputs): ApplicationConfig => {
  const appConfig = usecases.getApplicationConfig(inputs);
  const specId = getSpecId(appConfig.appName, appConfig.tag);
  return {
    ...appConfig,
    specId,
  };
}

/**
 * There's a bug in the provider for App Platform in which provisioning hangs if the spec
 * hasn't changed. Hence, generate a unique ID each time we provision.
 */
const getSpecId = (appName: string, tag: string): string => {
  return `${appName}/${tag}/${randomString()}`;
}
