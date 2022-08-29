export abstract class EntityError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// See https://stackoverflow.com/a/41102306/3604254 for why Object.setPrototypeOf is required

export class InvalidArgumentError extends EntityError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidArgumentError.prototype);
  }

  static create({
    argument,
    parameter,
    expected,
  }: {
    argument: string;
    parameter: string;
    expected: string;
  }) {
    let message = `Invalid argument ${argument} passed to ${parameter}`;
    if (expected) {
      message += `, expected ${expected}`;
    }
    return new InvalidArgumentError(message);
  }
}

export class UnauthorisedUser extends EntityError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, UnauthorisedUser.prototype);
  }

  static create(userId: string, action: string, resource: string) {
    return new UnauthorisedUser(
      `User ${userId} is not authorised to perform ${action} on ${resource}`
    );
  }
}

export class EntityNotFoundError extends EntityError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, EntityNotFoundError.prototype);
  }

  static create(id: string, entityType: string) {
    return new EntityNotFoundError(`Could not find ${entityType} (id=${id})`);
  }
}
