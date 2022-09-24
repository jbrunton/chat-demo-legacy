import * as aws from "@pulumi/aws";

const provider = new aws.Provider("aws", { region: "eu-west-2" });

const cluster = new aws.ecs.Cluster("chat-demo", undefined, { provider });

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

const securityGroup = new aws.ec2.SecurityGroup(
  "chat-demo",
  {
    vpcId: vpc.id,
    description: "HTTPS access",
    ingress: [
      {
        protocol: "tcp",
        fromPort: 80,
        toPort: 80,
        cidrBlocks: ["0.0.0.0/0"],
      },
      {
        protocol: "tcp",
        fromPort: 443,
        toPort: 443,
        cidrBlocks: ["0.0.0.0/0"],
      },
    ],
    egress: [
      {
        protocol: "-1",
        fromPort: 0,
        toPort: 0,
        cidrBlocks: ["0.0.0.0/0"],
      },
    ],
  },
  { provider }
);

const loadBalancer = new aws.lb.LoadBalancer(
  "chat-demo",
  {
    internal: false,
    loadBalancerType: "application",
    subnets: subnets.ids,
    securityGroups: [securityGroup.id],
  },
  { provider }
);

const zoneId = aws.route53
  .getZone({ name: "jbrunton-aws.com" }, { provider })
  .then((zone) => zone.id);

const certificate = new aws.acm.Certificate(
  "chat-demo",
  {
    domainName: "chat-demo.jbrunton-aws.com",
    validationMethod: "DNS",
    subjectAlternativeNames: [
      "chat-demo.staging.jbrunton-aws.com",
      "*.chat-demo.dev.jbrunton-aws.com"
    ]
  },
  { provider }
);

const records = certificate.domainValidationOptions.apply((options) =>
  options.map(
    (option) =>
      new aws.route53.Record(option.resourceRecordName, {
        allowOverwrite: true,
        name: option.resourceRecordName,
        records: [option.resourceRecordValue],
        ttl: 60,
        type: option.resourceRecordType,
        zoneId,
      }, { provider })
  )
);

new aws.acm.CertificateValidation(
  "chat-demo",
  {
    certificateArn: certificate.arn,
    validationRecordFqdns: records.apply((record) =>
      record.map((record) => record.fqdn)
    ),
  },
  { provider }
)

const listener = new aws.lb.Listener(
  "chat-demo",
  {
    loadBalancerArn: loadBalancer.arn,
    port: 443,
    protocol: "HTTPS",
    certificateArn: certificate.arn,
    defaultActions: [
      {
        type: "fixed-response",
        fixedResponse: {
          statusCode: "503",
          contentType: "text/plain",
        },
      },
    ],
  },
  { provider }
);

export const loadBalancerArn = loadBalancer.arn;
export const clusterArn = cluster.arn;
export const securityGroupId = securityGroup.id;
export const certificateArn = certificate.arn;
export const listenerArn = listener.arn;
export const vpcId = vpc.id;
