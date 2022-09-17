import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const provider = new aws.Provider("aws", { region: "eu-west-2" });

//const cluster = new aws.ecs.Cluster("chat-demo", undefined, { provider });

//const vpc = aws.ec2.getVpc();

const vpc = awsx.ec2.Vpc.getDefault({ provider });

const subnetIds = vpc.getSubnets("public").then(subnets => subnets.map(subnet => subnet.id));
//const 

// const subnet1 = new aws.ec2.Subnet("default_subnet_2a", {
//   availabilityZone: "eu-west-2a"
// }, { provider });

// const subnet2 = new aws.ec2.DefaultSubnet("default_subnet_2b", {
//   availabilityZone: "eu-west-2b"
// }, { provider });

// const sg = new aws.ec2.SecurityGroup("chat-demo", undefined, { provider });
// const subnet = new aws.ec2.Subnet("chat-demo", {
//   vpcId: vpc.id,
//   cidrBlock: "10.0.1.0/16",
// }, { provider });

const loadBalancer = new aws.lb.LoadBalancer("chat-demo", {
  internal: false,
  loadBalancerType: "application",
  subnets: subnetIds
  // securityGroups: [sg.id],
  // subnets: [subnet.id],
}, { provider });

export const loadBalancerArn = loadBalancer.arn;
// export const clusterArn = cluster.arn;
// export const listenerArn = listener.arn;
