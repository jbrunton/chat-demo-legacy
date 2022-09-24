import { cleanupLegacyStacks } from "@app/cleanup/cleanup-legacy-stacks";

cleanupLegacyStacks().catch((e) => {
  console.error(e);
  process.exit(1);
});
