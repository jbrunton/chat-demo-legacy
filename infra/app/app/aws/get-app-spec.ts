import { Environment } from "@entities";
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
            name: "ENVIRONMENT",
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
      },
      {
        name: "logzio-log-router",
        image: "jbrunton/aws-for-fluent-bit-multiline:latest",
        essential: true,
        firelensConfiguration: {
          type: "fluentbit",
          options: {
            "enable-ecs-log-metadata": "true",
            "config-file-type": "file",
            "config-file-value": "/extra.conf",
          },
        },
        logConfiguration: {
          logDriver: "awslogs",
          options: {
            "awslogs-group": logGroupName,
            "awslogs-region": "us-east-1",
            "awslogs-stream-prefix": "ecs",
          },
        },
        environment: [
          {
            name: "ENVIRONMENT",
            value: config.environment,
          },
        ],
      },
    ]),
  };
};

const getParamArn = (name: string, env: Environment = "production") =>
  `arn:aws:ssm:us-east-1:030461922427:parameter/chat-demo/${env}/${name}`;
