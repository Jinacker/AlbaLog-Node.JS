import { Get, Tags, Route, SuccessResponse, Response } from 'tsoa';
import prisma from '../config/prisma';
import { TsoaFailResponse, TsoaSuccessResponse, ResultType } from '../config/response_interface';
import { generateTokens } from '../config/jwt';

@Route('api/test')
@Tags('Test')
export class TestController {
  /**
   * 테스트 유저 액세스 토큰 (Swagger 테스트 용)
   *
   * @summary 테스트 유저의 액세스 토큰 발급
   * @returns 테스트 유저의 액세스 토큰
   */
  @Get('/')
  @SuccessResponse('200', 'Success')
  @Response<TsoaFailResponse<string>>('401', 'Unauthorized', {
    resultType: ResultType.FAIL,
    error: {
      errorCode: 'ERR-1',
      errorMessage: 'Unauthorized',
      data: null,
    },
    success: null,
  })
  public async getTest(): Promise<TsoaSuccessResponse<string>> {
    const testUser = await prisma.user.findFirst({
      where: {
        user_name: 'test_user',
      },
    });

    const { accessToken } = await generateTokens({
      id: testUser.user_id,
      email: testUser.email,
    });

    return new TsoaSuccessResponse(accessToken);
  }
}
