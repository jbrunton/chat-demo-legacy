import * as aws from "@pulumi/aws";
import { StackConfig } from "./usecases/stack/get-stack-config";

export const getTaskDefinitionSpec = (
  config: StackConfig,
  executionRoleArn: string,
  logGroupName: string
): aws.ecs.TaskDefinitionArgs => {
  const containerDefinitions: Record<string, unknown>[] = [getAppSpec(config)];

  if (config.environment !== "development") {
    containerDefinitions.push(getLogsRouterSpec(logGroupName));
  }

  return {
    family: config.appName,
    cpu: "256",
    memory: "512",
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    executionRoleArn,
    containerDefinitions: JSON.stringify(containerDefinitions),
  };
};

const getParamArn = (name: string) =>
  `arn:aws:ssm:eu-west-2:030461922427:parameter/chat-demo/production/${name}`;

const getAppSpec = (config: StackConfig) => ({
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
      name: "NEXTAUTH_URL",
      value: config.publicUrl,
    },
    {
      name: "EMAIL_TRANSPORT",
      value: "sendgrid",
    },
  ],
  secrets: [
    {
      name: "GOOGLE_CLIENT_ID",
      valueFrom: getParamArn("google-client-id"),
    },
    {
      name: "GOOGLE_CLIENT_SECRET",
      valueFrom: getParamArn("google-client-secret"),
    },
    {
      name: "NEXTAUTH_SECRET",
      valueFrom: getParamArn("next-auth-secret"),
    },
    {
      name: "SENDGRID_API_KEY",
      valueFrom: getParamArn("sendgrid-api-key"),
    },
  ],
  logConfiguration: {
    logDriver: "awsfirelens",
    options: {
      Name: "Http",
      Host: "listener.logz.io",
      Port: "8071",
      tls: "on",
      "tls.verify": "off",
      Format: "json_lines",
    },
    secretOptions: [
      {
        name: "URI",
        valueFrom: getParamArn("logz-io-uri"),
      },
    ],
  },
});

const getLogsRouterSpec = (logGroupName: string) => ({
  name: "logzio-log-router",
  image: "amazon/aws-for-fluent-bit:latest",
  essential: true,
  firelensConfiguration: {
    type: "fluentbit",
    options: {
      "enable-ecs-log-metadata": "true",
    },
  },
  logConfiguration: {
    logDriver: "awslogs",
    options: {
      "awslogs-group": logGroupName,
      "awslogs-region": "eu-west-2",
      "awslogs-stream-prefix": "ecs",
    },
  },
});
