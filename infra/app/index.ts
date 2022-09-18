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

const result = getSharedResources().apply(([lb, cluster, securityGroup, certificate]) =>
  createService(lb, cluster, securityGroup, certificate)
);

export const url = result.dnsName;

function getSharedResources(): pulumi.Output<
  [
    aws.lb.GetLoadBalancerResult,
    aws.ecs.GetClusterResult,
    aws.ec2.GetSecurityGroupResult,
    aws.acm.GetCertificateResult,
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
        aws.acm.getCertificate({ domain: '*.dev.jbrunton-aws.com' })
      ])
    );
}

function createService(
  lb: aws.lb.GetLoadBalancerResult,
  cluster: aws.ecs.GetClusterResult,
  securityGroup: aws.ec2.GetSecurityGroupResult,
  certificate: aws.acm.GetCertificateResult
) {
  const targetGroupA = new aws.lb.TargetGroup("example", {
    port: 80,
    protocol: "HTTP",
    targetType: "ip",
    vpcId: vpc.id,
  });

  const listenerA = new aws.lb.Listener("example", {
    loadBalancerArn: lb.arn,
    port: 80,
    protocol: "HTTP",
    //certificateArn: certificate.arn,
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
          //targetGroupA
          //listenerA
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

  const zoneId = aws.route53.getZone({ name: "jbrunton-aws.com" }, { provider }).then(zone => zone.id);

  // const certCertificate = new aws.acm.Certificate('cert', {
  //   domainName: '*.dev.jbrunton-aws.com',
  //   validationMethod: 'DNS',
  // });

  // const certValidation = new aws.route53.Record('cert_validation', {
  //   name: certCertificate.domainValidationOptions[0].resourceRecordName,
  //   records: [certCertificate.domainValidationOptions[0].resourceRecordValue],
  //   ttl: 60,
  //   type: certCertificate.domainValidationOptions[0].resourceRecordType,
  //   zoneId,
  // })
 
  // const certCertificateValidation = new aws.acm.CertificateValidation('cert', {
  //   certificateArn: certCertificate.arn,
  //   validationRecordFqdns: [certValidation.fqdn],
  // })
  
  const www = new aws.route53.Record("www", {
    zoneId,
    name: "example.dev.jbrunton-aws.com",
    type: "A",
    aliases: [{
        name: lb.dnsName,
        zoneId: lb.zoneId,
        evaluateTargetHealth: true,
    }],
  }, { provider });

  return {
    dnsName: lb.dnsName,
  };
}
