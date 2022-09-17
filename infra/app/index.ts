import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const provider = new aws.Provider("aws", { region: "eu-west-2" });

// const vpc = awsx.ec2.Vpc.getDefault({ provider });

const shared = new pulumi.StackReference("jbrunton/chat-demo-shared-infra/dev");
const loadBalancerArn = shared.getOutput("loadBalancerArn");
const clusterName = shared.getOutput("clusterName");
const securityGroupName = shared.getOutput("securityGroupName");

// const sg = aws.ec2.getSecurityGroup({ id: "sg-ba8248c5" }, { provider });

// pulumi.all([loadBalancerArn, clusterName]).apply(([loadBalancerArn, clusterName]) => {
//   pulumi.log.info(`stack outputs: ${JSON.stringify({ loadBalancerArn, clusterName}, null, " ")}`);
//   const loadBalancer = aws.lb.getLoadBalancer({ arn: loadBalancerArn }, { provider });

//   const cluster = aws.ecs.getCluster({ clusterName }, { provider });

//   const targetGroupWeb = new aws.lb.TargetGroup("chat-demo-web", {
//     port: 80,
//     protocol: "HTTP",
//     vpcId: vpc.id,
//     targetType: "ip"
//   }, { provider });

//   const webListener = new aws.lb.Listener("chat-demo-http", {
//     defaultActions: [{
//       type: "forward",
//       targetGroupArn: targetGroupWeb.arn,
//     }],
//     loadBalancerArn: loadBalancerArn,
//     port: 80,
//     //protocol: "HTTP",
//   });

//   const taskDefinition = new aws.ecs.TaskDefinition("web", {
//     family: "web",
//     cpu: "256",
//     memory: "512",
//     requiresCompatibilities: ["FARGATE"],
//     networkMode: "awsvpc",
//     containerDefinitions: JSON.stringify([{
//       name: "web",
//         image: "nginx",
//         portMappings: [
//           {
//             containerPort: 80,
//             hostPort: 80,
//             protocol: "HTTP"
//           },
//         ],
//         // name: "web",
//         // image: "traefik/whoami",
//         // portMappings: [{
//         //   containerPort: 80,
//         //   hostPort: 80
//         // }],
//       },
//     ]),
//   }, { provider });

//   const web = new aws.ecs.Service("web", {
//     cluster: clusterName,
//     launchType: "FARGATE",
//     loadBalancers: [{
//       containerName: "web",
//       containerPort: 80,
//       targetGroupArn: targetGroupWeb.arn
//     }],
//     networkConfiguration: {
//       assignPublicIp: true,
//       subnets: vpc.getSubnetsIds("public"),
//       securityGroups: [sg.then(sg => sg.id)],
//     },
//     taskDefinition: taskDefinition.arn,
//     desiredCount: 1,
//   }, { provider });

//   // new aws.lb.TargetGroupAttachment("s3-proxy", {
//   //   targetId: web.id,
//   //   targetGroupArn: targetGroupWeb.arn,
//   // })
// });

// // const targetGroupWeb = new awsx.lb.ApplicationTargetGroup("chat-demo-web", {
// //   port: 80,
// //   protocol: "HTTP",
// //   vpc: vpc,
// //   loadBalancer: loadBalancer
// // }, { provider });

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

const result = pulumi
  .all([loadBalancerArn, clusterName, securityGroupName])
  .apply(([loadBalancerArn, clusterName, securityGroupName]) => {
    pulumi.log.info(
      `stack outputs: ${JSON.stringify(
        { loadBalancerArn, clusterName },
        null,
        " "
      )}`
    );
    const lb = aws.lb.getLoadBalancer({ arn: loadBalancerArn }, { provider });

    const cluster = aws.ecs.getCluster({ clusterName }, { provider });
    const securityGroup = aws.ec2.getSecurityGroup({ name: securityGroupName });

    return pulumi
      .all([cluster, securityGroup, lb])
      .apply(([cluster, securityGroup, lb]) => {
        // // create a cluster
        // const cluster = new aws.ecs.Cluster("example");

        // define the default vpc info to deploy
        // const vpc = aws.ec2.getVpcOutput({ default: true }, { provider });
        // const subnets = aws.ec2.getSubnetsOutput({
        //   filters: [
        //     {
        //       name: "vpc-id",
        //       values: [vpc.id],
        //     },
        //   ],
        // }, { provider });

        // create the security groups
        // const securityGroup = new aws.ec2.SecurityGroup("example", {
        //   vpcId: vpc.id,
        //   description: "HTTP access",
        //   ingress: [
        //     {
        //       protocol: "tcp",
        //       fromPort: 80,
        //       toPort: 80,
        //       cidrBlocks: ["0.0.0.0/0"],
        //     },
        //   ],
        //   egress: [
        //     {
        //       protocol: "-1",
        //       fromPort: 0,
        //       toPort: 0,
        //       cidrBlocks: ["0.0.0.0/0"],
        //     },
        //   ],
        // });

        // define a loadbalancer
        // const lb = new aws.lb.LoadBalancer("example", {
        //   securityGroups: [securityGroup.id],
        //   subnets: subnets.ids,
        // });

        // target group for port 80
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
          dnsName: lb.dnsName
        };
      });
  });

export const url = result.dnsName;
