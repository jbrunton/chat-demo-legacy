export class UserError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class InvalidArgumentError extends UserError {
  constructor(message: string) {
    super(message);
    // See https://stackoverflow.com/a/41102306/3604254
    Object.setPrototypeOf(this, InvalidArgumentError.prototype);
  }
}

export class UnauthorisedUser extends UserError {
  constructor(message: string) {
    super(message);
    // See https://stackoverflow.com/a/41102306/3604254
    Object.setPrototypeOf(this, UnauthorisedUser.prototype);
  }

  static create(userId: string, action: string, resource: string) {
    return new UnauthorisedUser(
      `User ${userId} is not authorised to perform ${action} on ${resource}`
    );
  }
}

export class EntityNotFoundError extends UserError {
  constructor(message: string) {
    super(message);
    // See https://stackoverflow.com/a/41102306/3604254
    Object.setPrototypeOf(this, EntityNotFoundError.prototype);
  }

  static create(id: string, entityType: string) {
    return new EntityNotFoundError(`Could not find ${entityType} (id=${id})`);
  }
}
