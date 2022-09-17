import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const provider = new aws.Provider("aws", { region: "eu-west-2" });

const cluster = new aws.ecs.Cluster("chat-demo", undefined, { provider });

//const vpc = aws.ec2.getVpc();

const vpc = aws.ec2.getVpcOutput({ default: true }, { provider });
const subnets = aws.ec2.getSubnetsOutput({
  filters: [
    {
      name: "vpc-id",
      values: [vpc.id],
    },
  ],
}, { provider });
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

const securityGroup = new aws.ec2.SecurityGroup("example", {
  vpcId: vpc.id,
  description: "HTTP access",
  ingress: [
    {
      protocol: "tcp",
      fromPort: 80,
      toPort: 80,
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
}, { provider });

const loadBalancer = new aws.lb.LoadBalancer("chat-demo", {
  internal: false,
  loadBalancerType: "application",
  subnets: subnets.ids,
  securityGroups: [securityGroup.id],
  // securityGroups: [sg.id],
  // subnets: [subnet.id],
}, { provider });

export const loadBalancerArn = loadBalancer.arn;
export const clusterName = cluster.name;
export const securityGroupName = securityGroup.name;
// export const listenerArn = listener.arn;
