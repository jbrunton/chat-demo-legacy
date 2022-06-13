import { ApplicationInputs } from "@entities/application";
import { DomainConfig } from "@entities/domain";
import { GetStackConfig } from "@entities/stack";
import { getDomainConfig } from "@usecases/get-domain-config";
import { ApplicationConfig, getApplicationConfig } from "./get-application-config";

export type StackConfig = ApplicationConfig & DomainConfig;

export const getStackConfig: GetStackConfig<StackConfig> = (inputs: ApplicationInputs): StackConfig => {
  const appConfig = getApplicationConfig(inputs);
  const domainConfig = getDomainConfig(appConfig);
  return {
    ...appConfig,
    ...domainConfig,
  };
}
