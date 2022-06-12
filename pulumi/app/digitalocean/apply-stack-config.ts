import { App, AppArgs } from "@pulumi/digitalocean";
import { AppSpecService } from "@pulumi/digitalocean/types/input";
import { ApplyStackConfig } from "@entities/stack";
import { DOStackConfig } from "./get-stack-config";

export const applyStackConfig: ApplyStackConfig<DOStackConfig> = (config: DOStackConfig) => {
  const appSpec = getAppSpec(config);
  new App(config.appName, appSpec, {
    protect: config.protect
  });
}

const getAppSpec = (config: DOStackConfig): AppArgs => {
  const serviceSpec = getServiceSpec(config);
  return {
    spec: {
      name: config.appName,
      region: "lon",
      domainNames: [{
          name: config.domain,
          zone: config.rootDomain,
          type: "PRIMARY"
      }],
      services: [serviceSpec],
    },
  };
}

const getServiceSpec = (config: DOStackConfig): AppSpecService => {
  const { tag, publicUrl, specId } = config;
  return {
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
}
