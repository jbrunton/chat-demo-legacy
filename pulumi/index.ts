import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";
import { AppSpecService } from "@pulumi/digitalocean/types/input";

const stackName = pulumi.getStack();
const appName = `chat-demo-${stackName}`;

type Environment = "production" | "staging" | "development";

const getEnvironment = (): Environment => {
  switch (stackName) {
    case 'production': return 'production';
    case 'staging': return 'staging';
  }
  return 'development';
}

const environment = getEnvironment();

const getDomainName = (): string => {
  switch (environment) {
    case 'production': return 'chat-demo.jbrunton-do.com';
    case 'staging': return 'chat-demo.staging.jbrunton-do.com';
    case 'development': return stackName === 'dev'
      ? 'chat-demo.dev.jbrunton-do.com'
      : `${stackName}.chat-demo.dev.jbrunton-do.com`;
  }
};

const domainName = getDomainName();

pulumi.log.info(`environment config: environment=${environment}, domain=${domainName}`);

const app: AppSpecService = {
  name: "app",
  httpPort: 3000,
  github: {
    repo: "jbrunton/chat-demo",
    branch: "develop",
    deployOnPush: false,
  },
  envs: [{
    key: "NEXT_PUBLIC_DOMAIN",
    scope: "RUN_TIME",
    value: `https://${domainName}`,
  }],
  buildCommand: "cd app && npm ci && npm run build",
  runCommand: "cd app && npm run start",
  instanceCount: 1,
  instanceSizeSlug: "basic-xxs",
  environmentSlug: 'node-js',
  routes: [{
      path: "/",
  }],
};

new digitalocean.App(appName, {
  spec: {
    name: appName,
    region: "lon",
    domainNames: [{
        name: domainName,
        zone: "jbrunton-do.com",
        type: "PRIMARY"
    }],
    // databases: [{
    //   engine: "PG",
    //   name: "db",
    //   production: false,
    //   version: "12",
    // }],
    services: [app],
  },
});