import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const provider = new aws.Provider("aws", { region: "eu-west-2" });

const shared = new pulumi.StackReference("jbrunton/chat-demo-shared-infra/dev");

const vpc = aws.ec2.getVpcOutput({ default: true }, { provider });
const subnets = aws.ec2.getSubnetsOutput(
  {
    filters: [
      {
        name: "vpc-id",
        values: [vpc.id],
      },
    ],
  },
  { provider }
);

const result = getSharedResources().apply(([lb, cluster, securityGroup]) =>
  createService(lb, cluster, securityGroup)
);

export const url = result.dnsName;

function getSharedResources(): pulumi.Output<
  [
    aws.lb.GetLoadBalancerResult,
    aws.ecs.GetClusterResult,
    aws.ec2.GetSecurityGroupResult
  ]
> {
  return pulumi
    .all([
      shared.getOutput("loadBalancerArn"),
      shared.getOutput("clusterName"),
      shared.getOutput("securityGroupName"),
    ])
    .apply(([loadBalancerArn, clusterName, securityGroupName]) =>
      pulumi.all([
        aws.lb.getLoadBalancer({ arn: loadBalancerArn }, { provider }),
        aws.ecs.getCluster({ clusterName }, { provider }),
        aws.ec2.getSecurityGroup({ name: securityGroupName }),
      ])
    );
}

function createService(
  lb: aws.lb.GetLoadBalancerResult,
  cluster: aws.ecs.GetClusterResult,
  securityGroup: aws.ec2.GetSecurityGroupResult
) {
  const targetGroupA = new aws.lb.TargetGroup("example", {
    port: 80,
    protocol: "HTTP",
    targetType: "ip",
    vpcId: vpc.id,
  });

  // listener for port 80
  const listenerA = new aws.lb.Listener("example", {
    loadBalancerArn: lb.arn,
    port: 80,
    defaultActions: [
      {
        type: "forward",
        targetGroupArn: targetGroupA.arn,
      },
    ],
  });

  const role = new aws.iam.Role("example", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
      Service: "ecs-tasks.amazonaws.com",
    }),
  });

  new aws.iam.RolePolicyAttachment("example", {
    role: role.name,
    policyArn:
      "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
  });

  const taskDefinition = new aws.ecs.TaskDefinition("example", {
    family: "exampleA",
    cpu: "256",
    memory: "512",
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    executionRoleArn: role.arn,
    containerDefinitions: JSON.stringify([
      {
        name: "my-app",
        image: "nginx",
        portMappings: [
          {
            containerPort: 80,
            hostPort: 80,
            protocol: "tcp",
          },
        ],
      },
    ]),
  });

  const svcA = new aws.ecs.Service("example", {
    cluster: cluster.arn,
    desiredCount: 1,
    launchType: "FARGATE",
    taskDefinition: taskDefinition.arn,
    networkConfiguration: {
      assignPublicIp: true,
      subnets: subnets.ids,
      securityGroups: [securityGroup.id],
    },
    loadBalancers: [
      {
        targetGroupArn: targetGroupA.arn,
        containerName: "my-app",
        containerPort: 80,
      },
    ],
  });

  return {
    dnsName: lb.dnsName,
  };
}
