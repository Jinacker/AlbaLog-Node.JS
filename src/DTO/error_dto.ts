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
