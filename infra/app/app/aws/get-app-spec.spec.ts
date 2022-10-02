import { getTaskDefinitionSpec } from "./get-app-spec";
import { StackConfig } from "./usecases/stack/get-stack-config";

describe("getTaskDefinitionSpec", () => {
  it("generates a TaskDefinition spec for the given stack configuration", () => {
    const config: StackConfig = {
      stackName: "test",
      appName: "chat-demo-test",
      tag: "latest",
      environment: "development",
      protect: false,
      domain: "test.chat-demo.dev.jbrunton-aws.com",
      publicUrl: "https://test.chat-demo.dev.jbrunton-aws.com",
      rootDomain: "jbrunton-aws.com",
    };
    const spec = getTaskDefinitionSpec(
      config,
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
        {
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
              name: "ENVIRONMENT",
              value: "development",
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
                  "arn:aws:ssm:eu-west-2:030461922427:parameter/chat-demo/development/logz-io-uri",
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
              "awslogs-group": "/ecs/chat-demo-logs",
              "awslogs-region": "eu-west-2",
              "awslogs-stream-prefix": "ecs",
            },
          },
          environment: [
            {
              name: "ENVIRONMENT",
              value: "development",
            },
          ],
        },
      ]),
    });
  });
});
