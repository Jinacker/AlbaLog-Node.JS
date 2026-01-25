import { Controller, Get, Put, Route, Tags, Path, Body, SuccessResponse, Response } from 'tsoa';
import ProfileService from '../service/profile_service';
import { ProfileResponseDto, UpdateProfileRequestDto } from '../DTO/profile_dto';
import { TsoaSuccessResponse } from '../config/response_interface';
import { uuidToBuffer } from '../util/uuid_util';

/**
 * Profile Controller
 * 프로필 조회 및 수정 API
 */
@Route('api/profile')
@Tags('Profile')
export class ProfileController extends Controller {
  /**
   * 프로필 조회
   * @param userId - 사용자 ID (UUID 문자열)
   * @returns 프로필 정보
   */
  @Get('{userId}')
  @SuccessResponse('200', '프로필 조회 성공')
  @Response(404, 'User Not Found')
  @Response(500, 'Internal Server Error')
  public async getProfile(@Path() userId: string): Promise<TsoaSuccessResponse<ProfileResponseDto>> {
    // UUID 문자열을 Buffer로 변환
    const userIdBuffer = uuidToBuffer(userId);

    // Service 호출
    const profile = await ProfileService.getProfile(userIdBuffer);

    // 성공 응답 반환
    return new TsoaSuccessResponse(profile);
  }

  /**
   * 프로필 수정
   * @param userId - 사용자 ID (UUID 문자열)
   * @param requestBody - 수정할 프로필 데이터
   * @returns 수정된 프로필 정보
   */
  @Put('{userId}')
  @SuccessResponse('200', '프로필 수정 성공')
  @Response(400, 'Bad Request')
  @Response(404, 'User Not Found')
  @Response(500, 'Internal Server Error')
  public async updateProfile(
    @Path() userId: string,
    @Body() requestBody: UpdateProfileRequestDto,
  ): Promise<TsoaSuccessResponse<ProfileResponseDto>> {
    // UUID 문자열을 Buffer로 변환
    const userIdBuffer = uuidToBuffer(userId);

    // Service 호출
    const profile = await ProfileService.updateProfile(userIdBuffer, requestBody);

    // 성공 응답 반환
    return new TsoaSuccessResponse(profile);
  }
}
