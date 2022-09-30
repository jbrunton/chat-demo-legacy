import { Environment } from "@entities";
import { getTaskDefinitionSpec } from "./get-app-spec";
import { StackConfig } from "./usecases/stack/get-stack-config";

describe("getTaskDefinitionSpec", () => {
  const config: Omit<StackConfig, "environment"> = {
    stackName: "test",
    appName: "chat-demo-test",
    tag: "latest",
    protect: false,
    domain: "test.chat-demo.dev.jbrunton-aws.com",
    publicUrl: "https://test.chat-demo.dev.jbrunton-aws.com",
    rootDomain: "jbrunton-aws.com",
  };

  const expectedAppSpec = (environment: Environment) => ({
    name: "chat-demo-app",
    image: "jbrunton/chat-demo-app:latest",
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
        value: "https://test.chat-demo.dev.jbrunton-aws.com",
      },
      {
        name: "PORT",
        value: "80",
      },
      {
        name: "ENVIRONMENT_TYPE",
        value: environment,
      },
      {
        name: "TAG",
        value: "latest",
      },
      {
        name: "NEXTAUTH_URL",
        value: "https://test.chat-demo.dev.jbrunton-aws.com",
      },
      {
        name: "EMAIL_TRANSPORT",
        value: "sendgrid",
      },
    ],
    secrets: [
      {
        name: "GOOGLE_CLIENT_ID",
        valueFrom:
          "arn:aws:ssm:eu-west-2:030461922427:parameter/chat-demo/production/google-client-id",
      },
      {
        name: "GOOGLE_CLIENT_SECRET",
        valueFrom:
          "arn:aws:ssm:eu-west-2:030461922427:parameter/chat-demo/production/google-client-secret",
      },
      {
        name: "NEXTAUTH_SECRET",
        valueFrom:
          "arn:aws:ssm:eu-west-2:030461922427:parameter/chat-demo/production/next-auth-secret",
      },
      {
        name: "SENDGRID_API_KEY",
        valueFrom:
          "arn:aws:ssm:eu-west-2:030461922427:parameter/chat-demo/production/sendgrid-api-key",
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
          valueFrom:
            "arn:aws:ssm:eu-west-2:030461922427:parameter/chat-demo/production/logz-io-uri",
        },
      ],
    },
  });

  const expectedLogsRouterSpec = {
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
        "awslogs-group": "/ecs/chat-demo-logs",
        "awslogs-region": "eu-west-2",
        "awslogs-stream-prefix": "ecs",
      },
    },
  };

  it("generates a TaskDefinition spec for the given stack configuration", () => {
    const spec = getTaskDefinitionSpec(
      { ...config, environment: "production" },
      "executionRoleArn",
      "/ecs/chat-demo-logs"
    );
    expect(spec).toEqual({
      family: "chat-demo-test",
      cpu: "256",
      memory: "512",
      networkMode: "awsvpc",
      requiresCompatibilities: ["FARGATE"],
      executionRoleArn: "executionRoleArn",
      containerDefinitions: JSON.stringify([
        expectedAppSpec("production"),
        expectedLogsRouterSpec,
      ]),
    });
  });

  it("omits the log router for development environments", () => {
    const spec = getTaskDefinitionSpec(
      { ...config, environment: "development" },
      "executionRoleArn",
      "/ecs/chat-demo-logs"
    );
    expect(spec).toEqual({
      family: "chat-demo-test",
      cpu: "256",
      memory: "512",
      networkMode: "awsvpc",
      requiresCompatibilities: ["FARGATE"],
      executionRoleArn: "executionRoleArn",
      containerDefinitions: JSON.stringify([expectedAppSpec("development")]),
    });
  });
});
