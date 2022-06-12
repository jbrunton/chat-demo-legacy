import { ApplicationInputs } from "@entities/application";
import { DomainConfig } from "@entities/domain";
import { GetStackConfig } from "@entities/stack";
import { getDomainConfig } from "@usecases/get-domain-config";
import { DOApplicationConfig, getDOApplicationConfig } from "./get-application-config";

export type DOStackConfig = DOApplicationConfig & DomainConfig;

export const getStackConfig: GetStackConfig<DOStackConfig> = (inputs: ApplicationInputs): DOStackConfig => {
  const appConfig = getDOApplicationConfig(inputs);
  const domainConfig = getDomainConfig(appConfig);
  return {
    ...appConfig,
    ...domainConfig,
  };
}
