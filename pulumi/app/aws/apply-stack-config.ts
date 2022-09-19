import { ApplyStackConfig } from "@entities";
import { StackConfig } from "./usecases/stack/get-stack-config";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { getTaskDefinitionSpec, SharedResources } from "./get-app-spec";

const provider = new aws.Provider("aws", { region: "eu-west-2" });
const shared = new pulumi.StackReference("jbrunton/chat-demo-shared-infra/dev");

export const applyStackConfig: ApplyStackConfig<StackConfig> = (
  config: StackConfig
) => {
  const result = getSharedResources().apply((shared) =>
    createService(config, shared)
  );
};

function getSharedResources(): pulumi.Output<SharedResources> {
  return pulumi
    .all([
      shared.getOutput("loadBalancerArn"),
      shared.getOutput("listenerArn"),
      shared.getOutput("clusterArn"),
      shared.getOutput("securityGroupId"),
      shared.getOutput("vpcId"),
    ])
    .apply(
      ([loadBalancerArn, listenerArn, clusterArn, securityGroupId, vpcId]) => {
        const shared: SharedResources = {
          loadBalancer: {
            arn: loadBalancerArn,
            defaultListenerArn: listenerArn,
          },
          clusterArn,
          securityGroupId,
          vpcId,
        };
        return shared;
      }
    );
}

function createService(config: StackConfig, shared: SharedResources) {
  const subnets = aws.ec2.getSubnetsOutput(
    {
      filters: [
        {
          name: "vpc-id",
          values: [shared.vpcId],
        },
      ],
    },
    { provider }
  );

  const targetGroup = new aws.lb.TargetGroup(config.appName, {
    port: 80,
    protocol: "HTTP",
    targetType: "ip",
    vpcId: shared.vpcId,
  });

  new aws.lb.ListenerRule(config.appName, {
    listenerArn: shared.loadBalancer.defaultListenerArn,
    actions: [
      {
        type: "forward",
        targetGroupArn: targetGroup.arn,
      },
    ],
    conditions: [
      {
        hostHeader: {
          values: [config.domain],
        },
      },
    ],
  });

  const role = new aws.iam.Role(config.appName, {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
      Service: "ecs-tasks.amazonaws.com",
    }),
  });

  new aws.iam.RolePolicyAttachment(config.appName, {
    role: role.name,
    policyArn:
      "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
  });

  const webLogGroup = new aws.cloudwatch.LogGroup(
    `/ecs/${config.appName}`,
    {
      tags: {
        Stack: config.stackName,
        Environment: config.environment,
      },
      retentionInDays: 30,
    },
    { provider }
  );

  pulumi.all([webLogGroup.name, role.arn]).apply(([logGroupName, roleArn]) => {
    const taskDefinitionSpec = getTaskDefinitionSpec(
      config,
      roleArn,
      logGroupName
    );
    const taskDefinition = new aws.ecs.TaskDefinition(
      config.appName,
      taskDefinitionSpec
    );

    const svcA = new aws.ecs.Service(config.appName, {
      cluster: shared.clusterArn,
      desiredCount: 1,
      launchType: "FARGATE",
      taskDefinition: taskDefinition.arn,
      networkConfiguration: {
        assignPublicIp: true,
        subnets: subnets.ids,
        securityGroups: [shared.securityGroupId],
      },
      loadBalancers: [
        {
          targetGroupArn: targetGroup.arn,
          containerName: "chat-demo-app",
          containerPort: 80,
        },
      ],
    });
  });

  const lb = aws.lb.getLoadBalancerOutput({ arn: shared.loadBalancer.arn });

  const zoneId = aws.route53
    .getZone({ name: "jbrunton-aws.com" }, { provider })
    .then((zone) => zone.id);
  const www = new aws.route53.Record(
    config.appName,
    {
      zoneId,
      name: config.domain,
      type: "A",
      aliases: [
        {
          name: lb.dnsName,
          zoneId: lb.zoneId,
          evaluateTargetHealth: true,
        },
      ],
    },
    { provider }
  );

  return {
    dnsName: lb.dnsName,
  };
}
