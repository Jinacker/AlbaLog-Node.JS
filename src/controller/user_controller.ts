import { Get, Route, Tags, Request, Security, SuccessResponse, Response } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { generateTokens } from '../config/jwt';
import { UserNotFoundError } from '../DTO/error_dto';
import UserService from '../service/user_service';
import { TsoaSuccessResponse, TsoaFailResponse, ResultType } from '../config/response_interface';

@Route('api/user')
@Tags('User')
export class UserController {
  /**
   * 구글 로그인 콜백 함수입니다.
   * @param req
   * @param res
   * @summary 구글 로그인 콜백 함수 (직접 사용 x)
   * @returns
   */
  @Get('/auth/google/callback')
  public async googleCallback(@Request() req: ExpressRequest): Promise<void> {
    const { user_id, email } = req.user; // Passport Strategy에서 done(null, user)로 넘겨준 데이터

    if (!user_id) {
      throw new UserNotFoundError();
    }

    const { accessToken, refreshToken } = await generateTokens({ id: user_id, email: email });

    // 3. 보안 쿠키에 Refresh Token 설정
    req.res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    // 4. Access Token은 JSON 응답으로 보내거나 쿼리 파라미터로 리다이렉트
    // 프론트엔드 대시보드로 리다이렉트 시 예시:
    // 나중에 실제 주소로 리다이렉트 할 것
    req.res.redirect(`http://localhost:3000/?accessToken=${accessToken}`);
  }

  @Get('/info')
  @Security('jwt')
  public async getUserInfo(@Request() req: ExpressRequest): Promise<any> {
    return req.user;
  }

  /**
   * 액세스 토큰 재발급 api
   * @param req
   * @summary 액세스 토큰 재발급 API
   * @returns 재발급된 액세스 토큰
   */
  @Get('/auth/refresh')
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
  public async refreshAccessToken(
    @Request() req: ExpressRequest,
  ): Promise<TsoaSuccessResponse<string>> {
    const { refreshToken } = req.cookies || {};

    if (refreshToken === undefined) {
      throw new UserNotFoundError();
    }

    const result = await UserService.refreshAccessTokenService(refreshToken);

    return new TsoaSuccessResponse<string>(result);
  }

  @Get('/logout')
  public async logout(@Request() req: ExpressRequest): Promise<void> {
    req.res.clearCookie('refreshToken');
  }
}
