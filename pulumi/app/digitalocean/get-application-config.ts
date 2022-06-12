import { ApplicationConfig, ApplicationInputs } from "@entities/application";
import { getApplicationConfig } from "@usecases/get-application-config";
import { randomString } from "./random";

export type DOApplicationConfig = ApplicationConfig & {
  specId: string;
}

export const getDOApplicationConfig = (inputs: ApplicationInputs): DOApplicationConfig => {
  const appConfig = getApplicationConfig(inputs);
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
