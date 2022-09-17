import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const provider = new aws.Provider("aws", { region: "eu-west-2" });

const cluster = new awsx.ecs.Cluster("chat-demo", undefined, { provider });
const loadBalancer = new awsx.lb.ApplicationLoadBalancer(
  "chat-demo",
  undefined,
  { provider }
);

export const loadBalancerUrn = loadBalancer.urn;
export const clusterUrn = cluster.urn;
