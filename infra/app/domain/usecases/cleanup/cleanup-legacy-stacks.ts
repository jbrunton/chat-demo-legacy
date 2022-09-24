import { StackSummary } from "@pulumi/pulumi/automation";
import { getLegacyStacks, LegacyStack } from "./get-legacy-stacks";

export interface StackCleaner {
  destroyStack(stackName: string): Promise<void>;
  removeStack(stackName: string): Promise<void>;
}

export const cleanupLegacyStacks = async (
  stacks: StackSummary[],
  cleaner: StackCleaner
) => {
  const legacyStacks = getLegacyStacks(stacks);
  console.log(`Found ${legacyStacks.length} legacy dev stack(s)`);

  const cleanupStack = async ({ name, requireDestroy }: LegacyStack) => {
    if (requireDestroy) {
      await cleaner.destroyStack(name);
      console.log(`Destroyed legacy stack: ${name}`);
    }

    await cleaner.removeStack(name);
    console.log(`Removed legacy stack: ${name}`);
  };

  await Promise.all(legacyStacks.map(cleanupStack));
};
