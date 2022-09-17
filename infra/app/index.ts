import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const provider = new aws.Provider("aws", { region: "eu-west-2" });

const vpc = awsx.ec2.Vpc.getDefault({ provider });

const shared = new pulumi.StackReference("jbrunton/chat-demo-shared-infra/dev");
const loadBalancerArn = shared.getOutput("loadBalancerArn");
const clusterName = shared.getOutput("clusterName");

const loadBalancer = loadBalancerArn.apply((arn) =>
  aws.lb.getLoadBalancer({ arn }, { provider })
);

const cluster = clusterName.apply((name) =>
  aws.ecs.getCluster({ clusterName: name }, { provider })
);

const targetGroupWeb = new aws.lb.TargetGroup("chat-demo-web", {
  port: 80,
  protocol: "HTTP",
  vpcId: vpc.id,

}, { provider });

// const targetGroupWeb = new awsx.lb.ApplicationTargetGroup("chat-demo-web", {
//   port: 80,
//   protocol: "HTTP",
//   vpc: vpc,
//   loadBalancer: loadBalancer
// }, { provider });
