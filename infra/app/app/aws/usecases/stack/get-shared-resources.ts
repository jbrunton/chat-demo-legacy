import * as pulumi from "@pulumi/pulumi";

export type SharedResources = {
  loadBalancer: {
    arn: string;
    defaultListenerArn: string;
  };
  securityGroupId: string;
  vpcId: string;
};

export const getSharedResources = (): pulumi.Output<SharedResources> => {
  const shared = new pulumi.StackReference(
    "jbrunton/chat-demo-shared-infra/production"
  );
  return pulumi
    .all([
      shared.getOutput("loadBalancerArn"),
      shared.getOutput("listenerArn"),
      shared.getOutput("securityGroupId"),
      shared.getOutput("vpcId"),
    ])
    .apply(([loadBalancerArn, listenerArn, securityGroupId, vpcId]) => {
      const shared: SharedResources = {
        loadBalancer: {
          arn: loadBalancerArn,
          defaultListenerArn: listenerArn,
        },
        securityGroupId,
        vpcId,
      };
      return shared;
    });
};
