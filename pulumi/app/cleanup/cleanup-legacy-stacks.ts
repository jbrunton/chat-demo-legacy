import { LocalWorkspace } from "@pulumi/pulumi/automation";
import * as usecases from "@usecases";

const workDir = ".";

export const cleanupLegacyStacks = async () => {
  const workspace = await LocalWorkspace.create({ workDir });
  const stacks = await workspace.listStacks();
  const cleaner = new StackCleaner(workspace);
  await usecases.cleanupLegacyStacks(stacks, cleaner);
};

class StackCleaner implements usecases.StackCleaner {
  private readonly workspace: LocalWorkspace;

  constructor(workspace: LocalWorkspace) {
    this.workspace = workspace;
  }

  async destroyStack(stackName: string): Promise<void> {
    await LocalWorkspace.selectStack({ stackName, workDir });
  }

  async removeStack(stackName: string): Promise<void> {
    await this.workspace.removeStack(stackName);
  }
}
