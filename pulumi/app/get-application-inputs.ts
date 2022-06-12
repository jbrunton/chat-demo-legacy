import * as pulumi from "@pulumi/pulumi";
import { GetApplicationInputs } from "@entities/application";

export const getApplicationInputs: GetApplicationInputs = () => {
  const stackName = pulumi.getStack();
  const tag = process.env.TAG || "latest";
  return {
    stackName,
    tag,
  };
}
