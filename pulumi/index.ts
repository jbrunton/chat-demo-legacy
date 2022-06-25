import "./load-paths";
import * as pulumi from "@pulumi/pulumi";
import { getStackConfig } from "@app/digitalocean/get-stack-config";
import { applyStackConfig } from "@app/digitalocean/apply-stack-config";
import { getApplicationInputs } from "@app/get-application-inputs";

const inputs = getApplicationInputs();
const config = getStackConfig(inputs);

pulumi.log.info(`stack config: ${JSON.stringify(config, null, " ")}`);

applyStackConfig(config);

export const publicUrl = config.publicUrl;
