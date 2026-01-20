import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../DTO/errorDTO';
import { ValidateError } from 'tsoa';

const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  /**
   * 커스텀 에러 핸들링
   */
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({
      resultType: 'FAIL',
      error: {
        errorCode: err.errorCode,
        errorMessage: err.message,
        data: err.data,
      },
      success: null,
    });
  }

  /**
   * tsoa validation 에러 핸들링
   */
  if (err instanceof ValidateError) {
    res.status(err.status).json({
      resultType: 'FAIL',
      error: {
        errorCode: err.status,
        errorMessage: err.message,
        data: err.fields,
      },
      success: null,
    });
  }

  /**
   * 기본 에러 핸들링
   * 500번으로 status 고정
   */
  res.status(500).json({
    resultType: 'FAIL',
    error: {
      errorCode: '500',
      errorMessage: err.message || 'Internal Server Error',
      data: null,
    },
    success: null,
  });
};

export default errorMiddleware;
