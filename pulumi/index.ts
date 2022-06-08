import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";
import { AppSpecService } from "@pulumi/digitalocean/types/input";
import { getEnvironmentConfig } from "./lib/config";

const stackName = pulumi.getStack();
const tag = process.env.TAG || "latest";
const config = getEnvironmentConfig({ stackName, tag });
export const publicUrl = config.publicUrl;

pulumi.log.info(`environment config: ${JSON.stringify(config, null, ' ')}`);

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
    value: publicUrl,
  }, {
    key: "TAG",
    scope: "RUN_TIME",
    value: tag,
  }, {
    key: "SPEC_ID",
    scope: "RUN_TIME",
    value: config.specId,
  }],
  instanceCount: 1,
  instanceSizeSlug: "basic-xxs",
  routes: [{
      path: "/",
  }],
};

new digitalocean.App(config.appName, {
  spec: {
    name: config.appName,
    region: "lon",
    domainNames: [{
        name: config.domain,
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
  protect: config.environment === 'production'
});
