export function assertNotNil(input: unknown): asserts input {
  if (input === null || input === undefined) {
    throw new Error(`Expected input not to be nil`);
  }
}
