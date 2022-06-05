import * as pulumi from "@pulumi/pulumi";
import * as crypto from "crypto";
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

/**
 * There's a bug in Pulumi provisioning for App Platform in which provisioning hangs if the spec
 * hasn't changed. Hence, generate a unique ID each time we provision.
 */
const getSpecId = (): string => {
  return `${appName}/${tag}/${crypto.randomBytes(4).toString('hex')}`;
}

const domainName = getDomainName();

const tag = process.env.TAG || "latest";

const specId = getSpecId();

const info = {
  environment,
  domain: domainName,
  tag,
  specId,
};

pulumi.log.info(`environment config: ${JSON.stringify(info, null, ' ')}`);

const app: AppSpecService = {
  name: "app",
  httpPort: 3000,
  image: {
    registry: "jbrunton",
    registryType: "DOCKER_HUB",
    repository: "chat-demo-app",
    tag,
  },
  envs: [{
    key: "NEXT_PUBLIC_DOMAIN",
    scope: "RUN_TIME",
    value: `https://${domainName}`,
  }, {
    key: "TAG",
    scope: "RUN_TIME",
    value: tag,
  }, {
    key: "SPEC_ID",
    scope: "RUN_TIME",
    value: specId,
  }],
  instanceCount: 1,
  instanceSizeSlug: "basic-xxs",
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
}, {
  protect: environment === 'production'
});
