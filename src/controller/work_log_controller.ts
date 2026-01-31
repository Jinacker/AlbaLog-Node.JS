import { Controller, Get, Patch, Route, Tags, Path, SuccessResponse, Response } from 'tsoa';
import WorkLogService from '../service/work_log_service';
import { TodayWorkListResponseDto, CheckInResponseDto } from '../DTO/work_log_dto';
import { TsoaSuccessResponse } from '../config/response_interface';
import { uuidToBuffer } from '../util/uuid_util';

/**
 * Work Log Controller
 * 근무 기록 조회 API
 */
@Route('api/users')
@Tags('WorkLog')
export class WorkLogController extends Controller {
  /**
   * 오늘의 근무 리스트 조회
   * @param userId - 사용자 ID (UUID 문자열)
   * @returns 오늘의 근무 리스트
   */
  @Get('{userId}/work-logs/today')
  @SuccessResponse('200', '오늘의 근무 리스트 조회 성공')
  @Response(404, 'User Not Found')
  @Response(500, 'Internal Server Error')
  public async getTodayWorkLogs(
    @Path() userId: string,
  ): Promise<TsoaSuccessResponse<TodayWorkListResponseDto>> {
    // UUID 문자열을 Buffer로 변환
    const userIdBuffer = uuidToBuffer(userId);

    // Service 호출
    const schedules = await WorkLogService.getTodaySchedules(userIdBuffer);

    // 성공 응답 반환
    return new TsoaSuccessResponse(schedules);
  }

  /**
   * 출근하기
   * 근무 상태를 scheduled → working으로 변경합니다.
   * @param userId - 사용자 ID (UUID 문자열)
   * @param workLogId - 근무 기록 ID (UUID 문자열)
   * @returns 출근 처리 결과
   */
  @Patch('{userId}/work-logs/{workLogId}/check-in')
  @SuccessResponse('200', '출근 처리 성공')
  @Response(400, 'Bad Request - 이미 출근한 상태이거나 출근 불가능한 상태')
  @Response(404, 'Work Log Not Found')
  @Response(500, 'Internal Server Error')
  public async checkIn(
    @Path() userId: string,
    @Path() workLogId: string,
  ): Promise<TsoaSuccessResponse<CheckInResponseDto>> {
    // UUID 문자열을 Buffer로 변환
    const workLogIdBuffer = uuidToBuffer(workLogId);

    // Service 호출
    const result = await WorkLogService.checkIn(workLogIdBuffer);

    // 성공 응답 반환
    return new TsoaSuccessResponse(result);
  }
}
