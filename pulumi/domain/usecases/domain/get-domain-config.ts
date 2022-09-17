import { DomainInputs, GetDomainConfig } from "@entities/domain";

const rootDomain = "jbrunton-do.com";

export const getDomainConfig: GetDomainConfig = (inputs: DomainInputs) => {
  const domain = getDomainName(inputs);
  const publicUrl = `http://${domain}`;
  return {
    domain,
    publicUrl,
    rootDomain,
  };
};

const getDomainName = (inputs: DomainInputs): string => {
  switch (inputs.environment) {
    case "production":
      return `chat-demo.${rootDomain}`;
    case "staging":
      return `chat-demo.staging.${rootDomain}`;
    case "development":
      return `${inputs.stackName}.chat-demo.dev.${rootDomain}`;
  }
};
