import { ApplicationInputs, Environment, GetApplicationConfig } from "@entities/application";

export const getApplicationConfig: GetApplicationConfig = (inputs: ApplicationInputs) => {
  const { stackName, tag } = inputs;
  const environment = getEnvironment(inputs.stackName);
  const appName = getAppName(inputs.stackName);
  const protect = environment === "production";
  return {
    stackName,
    appName,
    environment,
    tag,
    protect,
  };
}

const getEnvironment = (stackName: string): Environment => {
  switch (stackName) {
    case 'production': return 'production';
    case 'staging': return 'staging';
  }
  return 'development';
}

const getAppName = (stackName: string): string => {
  return `chat-demo-${cleanString(stackName)}`.slice(0, 32);
}

const cleanString = (s: string) => s.replace('/', '').replace('.', '');
