import { ApplyStackConfig } from "@entities";
import { StackConfig } from "./usecases/stack/get-stack-config";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

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

export const applyStackConfig: ApplyStackConfig<StackConfig> = (
  config: StackConfig
) => {
  const result = getSharedResources().apply(
    ([lb, listener, cluster, securityGroup, certificate]) =>
      createService(lb, listener, cluster, securityGroup, certificate, config)
  );
};

function getSharedResources(): pulumi.Output<
  [
    aws.lb.GetLoadBalancerResult,
    aws.lb.GetListenerResult,
    aws.ecs.GetClusterResult,
    aws.ec2.GetSecurityGroupResult,
    aws.acm.GetCertificateResult
  ]
> {
  return pulumi
    .all([
      shared.getOutput("loadBalancerArn"),
      shared.getOutput("listenerArn"),
      shared.getOutput("clusterName"),
      shared.getOutput("securityGroupName"),
    ])
    .apply(([loadBalancerArn, listenerArn, clusterName, securityGroupName]) =>
      pulumi.all([
        aws.lb.getLoadBalancer({ arn: loadBalancerArn }, { provider }),
        aws.lb.getListener({ arn: listenerArn }),
        aws.ecs.getCluster({ clusterName }, { provider }),
        aws.ec2.getSecurityGroup({ name: securityGroupName }),
        aws.acm.getCertificate({ domain: "*.chat-demo.dev.jbrunton-aws.com" }),
      ])
    );
}

function createService(
  lb: aws.lb.GetLoadBalancerResult,
  listener: aws.lb.GetListenerResult,
  cluster: aws.ecs.GetClusterResult,
  securityGroup: aws.ec2.GetSecurityGroupResult,
  certificate: aws.acm.GetCertificateResult,
  config: StackConfig
) {
  const targetGroupA = new aws.lb.TargetGroup(config.appName, {
    port: 80,
    protocol: "HTTP",
    targetType: "ip",
    vpcId: vpc.id,
  });

  new aws.lb.ListenerRule(config.appName, {
    listenerArn: listener.arn,
    //priority: 100,
    actions: [
      {
        type: "forward",
        targetGroupArn: targetGroupA.arn,
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
    },
    { provider }
  );

  webLogGroup.name.apply((logGroupName) => {
    const taskDefinition = new aws.ecs.TaskDefinition(config.appName, {
      family: config.appName,
      cpu: "256",
      memory: "512",
      networkMode: "awsvpc",
      requiresCompatibilities: ["FARGATE"],
      executionRoleArn: role.arn,
      containerDefinitions: JSON.stringify([
        {
          name: "chat-demo-app",
          image: `jbrunton/chat-demo-app:${config.tag}`,
          portMappings: [
            {
              containerPort: 80,
              hostPort: 80,
              protocol: "tcp",
            },
          ],
          environment: [
            {
              name: "NEXT_PUBLIC_DOMAIN",
              value: config.publicUrl,
            },
            {
              name: "PORT",
              value: "80",
            },
            {
              name: "ENVIRONMENT_TYPE",
              value: config.environment,
            },
            {
              name: "TAG",
              value: config.tag,
            },
            {
              name: "GOOGLE_CLIENT_ID",
              value: process.env.GOOGLE_CLIENT_ID,
            },
            {
              name: "GOOGLE_CLIENT_SECRET",
              value: process.env.GOOGLE_CLIENT_SECRET,
            },
            {
              name: "NEXTAUTH_URL",
              value: config.publicUrl,
            },
            {
              name: "NEXTAUTH_SECRET",
              value: process.env.NEXTAUTH_SECRET,
            },
            {
              name: "EMAIL_TRANSPORT",
              value: "sendgrid",
            },
            {
              name: "SENDGRID_API_KEY",
              value: process.env.SENDGRID_API_KEY,
            },
          ],
          logConfiguration: {
            logDriver: "awslogs",
            options: {
              "awslogs-group": logGroupName,
              "awslogs-region": "eu-west-2",
              "awslogs-stream-prefix": "ecs",
            },
          },
        },
      ]),
    });

    const svcA = new aws.ecs.Service(config.appName, {
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
          containerName: "chat-demo-app",
          containerPort: 80,
        },
      ],
    });
  });

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
