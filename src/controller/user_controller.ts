import {
  Controller,
  Get,
  Route,
  Tags,
  Request,
  Security,
  SuccessResponse,
  Response,
  Body,
  Post,
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { generateTokens } from '../config/jwt';
import { UserNotFoundError } from '../DTO/error_dto';
import UserService from '../service/user_service';
import { TsoaSuccessResponse, TsoaFailResponse, ResultType } from '../config/response_interface';
import { ResponseFromInitialRegion, ResponseFromUser, UserRegisterParams } from '../DTO/userDTO';

@Route('api/user')
@Tags('User')
export class UserController extends Controller {
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
    // req.res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: 'lax',
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    // });

    // 4. Access Token은 JSON 응답으로 보내거나 쿼리 파라미터로 리다이렉트
    // 프론트엔드 대시보드로 리다이렉트 시 예시:
    // 나중에 실제 주소로 리다이렉트 할 것
    req.res.redirect(
      `http://localhost:5173/onboarding?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
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

  /**
   * 상세 회원가입 api
   * @param req
   * @param body
   * @summary 상세 회원가입 API
   * @returns 업데이트된 유저 프로필 내용
   */
  @Post('/auth/register')
  @Security('jwt')
  @SuccessResponse('201', 'Created')
  @Response(400, 'Bad Request')
  @Response(401, 'Unauthorized')
  @Response(500, 'Internal Server Error')
  public async register(
    @Request() req: ExpressRequest,
    @Body() body: UserRegisterParams,
  ): Promise<TsoaSuccessResponse<ResponseFromUser>> {
    const userId = (req.user as unknown as { id: string }).id;

    const userInfo = await UserService.registerUser(userId, body);

    this.setStatus(201);
    return new TsoaSuccessResponse<ResponseFromUser>(userInfo);
  }

  /**
   * 유저 선호 지역 선택
   * @summary 회원가입시 선호 지역 입력
   * @param req
   */
  @Post('/auth/region')
  @Security('jwt')
  @SuccessResponse('201', 'Created')
  @Response(400, 'Bad Request')
  @Response(401, 'Unauthorized')
  @Response(500, 'Internal Server Error')
  public async registerRegion(
    @Request() req: ExpressRequest,
    @Body() body: { regionCode: number[] },
  ): Promise<TsoaSuccessResponse<ResponseFromInitialRegion>> {
    const userId = (req.user as unknown as { id: string }).id;

    const result = await UserService.setUserRegion(userId, body.regionCode);

    this.setStatus(201);
    return new TsoaSuccessResponse<ResponseFromInitialRegion>(result);
  }

  @Get('/logout')
  public async logout(@Request() req: ExpressRequest): Promise<void> {
    req.res.clearCookie('refreshToken');
  }
}
