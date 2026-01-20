import { Get, Route, Tags, Request, Security } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { generateTokens } from '../config/jwt';

@Route('api/user')
@Tags('User')
export class UserController {
  /**
   * 구글 로그인 콜백 함수입니다.
   * @param req
   * @param res
   * @returns
   */
  @Get('/auth/google/callback')
  public async googleCallback(@Request() req: ExpressRequest): Promise<void> {
    const { user_id, email } = req.user; // Passport Strategy에서 done(null, user)로 넘겨준 데이터

    if (!user_id) {
      throw new Error('user_id가 없습니다.');
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
    req.res.redirect(`http://localhost:3000/?accessToken=${accessToken}`);
  }

  @Get('/info')
  @Security('jwt')
  public async getUserInfo(@Request() req: ExpressRequest): Promise<any> {
    return req.user;
  }
}
