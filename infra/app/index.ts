import "./load-paths";
import * as pulumi from "@pulumi/pulumi";
import { applyStackConfig } from "@app/aws/apply-stack-config";
import { getApplicationInputs } from "@app/get-application-inputs";
import { getStackConfig } from "@app/aws/usecases/stack/get-stack-config";

const config = getStackConfig(getApplicationInputs());
pulumi.log.info(`stack config: ${JSON.stringify(config, null, " ")}`);

applyStackConfig(config);

export const publicUrl = config.publicUrl;
