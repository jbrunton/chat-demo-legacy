export class InvalidArgumentError extends Error {
  constructor(message: string) {
    super(message);
    // See https://stackoverflow.com/a/41102306/3604254
    Object.setPrototypeOf(this, InvalidArgumentError.prototype);
  }
}
