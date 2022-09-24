export type Environment = "development" | "staging" | "production";

export interface ApplicationConfig {
  stackName: string;
  appName: string;
  tag: string;
  environment: Environment;
  protect: boolean;
}

export interface ApplicationInputs {
  stackName: string;
  tag: string;
}

export interface GetApplicationConfig<
  T extends ApplicationConfig = ApplicationConfig
> {
  (inputs: ApplicationInputs): T;
}

export interface GetApplicationInputs {
  (): ApplicationInputs;
}
