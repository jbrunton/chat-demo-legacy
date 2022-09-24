import * as aws from "@pulumi/aws";
import { StackConfig } from "./usecases/stack/get-stack-config";

export const getTaskDefinitionSpec = (
  config: StackConfig,
  executionRoleArn: string,
  logGroupName: string
): aws.ecs.TaskDefinitionArgs => {
  return {
    family: config.appName,
    cpu: "256",
    memory: "512",
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    executionRoleArn,
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
  };
};
