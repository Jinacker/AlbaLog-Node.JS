export class CustomError extends Error {
  constructor(
    public errorCode: string,
    public statusCode: number,
    public message: string,
    public data: any,
  ) {
    super(message);
  }
}

export class UserNotFoundError extends CustomError {
  constructor(message: string = 'User not found', data: any = null) {
    super('USER_NOT_FOUND', 404, message, data);
  }
}

export class InvalidTokenError extends CustomError {
  constructor(message: string = 'Invalid token', data: any = null) {
    super('INVALID_TOKEN', 401, message, data);
  }
}

export class UserRegionError extends CustomError {
  constructor(message: string = 'User Region Error', data: any = null) {
    super('USER_REGION_ERROR', 400, message, data);
  }
}
