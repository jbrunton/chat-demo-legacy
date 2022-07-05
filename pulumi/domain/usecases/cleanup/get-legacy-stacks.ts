import { StackSummary } from "@pulumi/pulumi/automation";
import { getEnvironment } from "@usecases/application/get-application-config";
import { subDays } from "date-fns";

export type LegacyStack = {
  name: string;
  requireDestroy: boolean;
};

export const getLegacyStacks = (stacks: StackSummary[]): LegacyStack[] => {
  return stacks.filter(isLegacy).map(({ name, resourceCount }) => ({
    name,
    requireDestroy: !!resourceCount,
  }));
};

const isLegacy = (stack: StackSummary) => {
  if (getEnvironment(stack.name) !== "development") {
    return false;
  }

  const cutoff = subDays(new Date(), 14);
  return stack.lastUpdate && new Date(stack.lastUpdate) < cutoff;
};
