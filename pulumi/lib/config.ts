import * as crypto from "crypto";
import { randomString } from "./random";

export type ConfigInputs = {
  tag: string;
  stackName: string;
}

export type Environment = "production" | "staging" | "development";

export type EnvironmentConfig = {
  tag: string;
  stackName: string;
  appName: string;
  environment: Environment;
  domain: string;
  publicUrl: string;
  specId: string;
};

export const getEnvironment = (stackName: string): Environment => {
  switch (stackName) {
    case 'production': return 'production';
    case 'staging': return 'staging';
  }
  return 'development';
}

const cleanString = (s: string) => s.replace('/', '').replace('.', '');

export const getAppName = (stackName: string): string => {
  return `chat-demo-${cleanString(stackName)}`.slice(0, 32);
}

const getDevDomainName = (stackName: string): string => {
  if (stackName === 'dev') {
    return 'chat-demo.dev.jbrunton-do.com';
  }
  
  const subdomain = cleanString(stackName);
  return `${subdomain}.chat-demo.dev.jbrunton-do.com`;
}

export const getDomainName = (environment: Environment, stackName: string): string => {
  switch (environment) {
    case 'production': return 'chat-demo.jbrunton-do.com';
    case 'staging': return 'chat-demo.staging.jbrunton-do.com';
    case 'development': return getDevDomainName(stackName);
  }
};

/**
 * There's a bug in Pulumi provisioning for App Platform in which provisioning hangs if the spec
 * hasn't changed. Hence, generate a unique ID each time we provision.
 */
export const getSpecId = (appName: string, tag: string): string => {
  return `${appName}/${tag}/${randomString()}`;
}

export const getEnvironmentConfig = ({ stackName, tag }: ConfigInputs): EnvironmentConfig => {
  const environment = getEnvironment(stackName);
  const appName = getAppName(stackName);
  const domain = getDomainName(environment, stackName);
  const specId = getSpecId(appName, tag);
  return {
    tag,
    stackName,
    appName,
    environment,
    domain,
    publicUrl: `https://${domain}`,
    specId,
  };
};
