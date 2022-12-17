import { DomainInputs, GetDomainConfig } from "@entities/domain";

export const getDomainConfig: GetDomainConfig = (inputs: DomainInputs) => {
  const domain = getDomainName(inputs);
  const publicUrl = `https://${domain}`;
  return {
    domain,
    publicUrl,
    rootDomain: inputs.rootDomain,
  };
};

const getDomainName = (inputs: DomainInputs): string => {
  switch (inputs.environment) {
    case "production":
      return `chat-demo.${inputs.rootDomain}`;
    case "staging":
      return `chat-demo.staging.${inputs.rootDomain}`;
    case "development":
      return `chat-demo-${inputs.stackName}.dev.${inputs.rootDomain}`;
  }
};
