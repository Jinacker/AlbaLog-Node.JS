export enum ResultType {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

interface ITsoaResponse<T> {
  resultType: ResultType;
  error: {
    errorCode?: string;
    errorMessage?: string | null;
    data?: any | null;
  } | null;
  success: T | null;
}

class TsoaSuccessResponse<T> implements ITsoaResponse<T> {
  resultType: ResultType = ResultType.SUCCESS;
  error: null = null;
  success: T;

  constructor(data: T) {
    this.success = data;
  }
}

class TsoaFailResponse<T> implements ITsoaResponse<T> {
  resultType: ResultType = ResultType.FAIL;
  error: {
    errorCode?: string;
    errorMessage?: string | null;
    data?: any | null;
  };
  success = null;
}

export { TsoaSuccessResponse, TsoaFailResponse };
export type { ITsoaResponse };
