import { Controller, Get, Patch, Path, Route, Tags, SuccessResponse, Response, Request, Security } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import WorkLogService from '../service/work_log_service';
import { TodayWorkListResponseDto, CheckInResponseDto, CheckOutResponseDto } from '../DTO/work_log_dto';
import { TsoaSuccessResponse } from '../config/response_interface';
import { uuidToBuffer } from '../util/uuid_util';

/**
 * Work Log Controller
 * 근무 기록 조회 API
 */
@Route('api/work-logs')
@Tags('WorkLog')
export class WorkLogController extends Controller {
  /**
   * 오늘의 근무 리스트 조회
   * @returns 오늘의 근무 리스트
   */
  @Get('today')
  @Security('jwt')
  @SuccessResponse('200', '오늘의 근무 리스트 조회 성공')
  @Response(401, 'Unauthorized')
  @Response(500, 'Internal Server Error')
  public async getTodayWorkLogs(
    @Request() req: ExpressRequest,
  ): Promise<TsoaSuccessResponse<TodayWorkListResponseDto>> {
    // JWT에서 userId 추출 후 Buffer로 변환
    const userId = (req.user as unknown as { id: string }).id;
    const userIdBuffer = uuidToBuffer(userId);

    // Service 호출
    const schedules = await WorkLogService.getTodaySchedules(userIdBuffer);

    // 성공 응답 반환
    return new TsoaSuccessResponse(schedules);
  }

  /**
   * 출근하기
   * 근무 상태를 scheduled → working으로 변경합니다.
   * JWT 토큰으로 인증된 사용자만 호출 가능합니다.
   * @param workLogId - 근무 기록 ID (UUID 문자열)
   * @returns 출근 처리 결과
   */
  @Patch('work-logs/{workLogId}/check-in')
  @Security('jwt')
  @SuccessResponse('200', '출근 처리 성공')
  @Response(400, 'Bad Request - 이미 출근한 상태이거나 출근 불가능한 상태')
  @Response(401, 'Unauthorized')
  @Response(404, 'Work Log Not Found')
  @Response(500, 'Internal Server Error')
  public async checkIn(
    @Request() req: ExpressRequest,
    @Path() workLogId: string,
  ): Promise<TsoaSuccessResponse<CheckInResponseDto>> {
    // JWT에서 userId 추출
    const userId = (req as any).user.id;
    const userIdBuffer = uuidToBuffer(userId);
    const workLogIdBuffer = uuidToBuffer(workLogId);

    // Service 호출 (userId로 권한 검증 포함)
    const result = await WorkLogService.checkIn(workLogIdBuffer, userIdBuffer);

    // 성공 응답 반환
    return new TsoaSuccessResponse(result);
  }

  /**
   * 퇴근하기
   * 근무 상태를 working → done으로 변경합니다.
   * JWT 토큰으로 인증된 사용자만 호출 가능합니다.
   * @param workLogId - 근무 기록 ID (UUID 문자열)
   * @returns 퇴근 처리 결과
   */
  @Patch('{workLogId}/check-out')
  @Security('jwt')
  @SuccessResponse('200', '퇴근 처리 성공')
  @Response(400, 'Bad Request - 퇴근 불가능한 상태')
  @Response(401, 'Unauthorized')
  @Response(404, 'Work Log Not Found')
  @Response(500, 'Internal Server Error')
  public async checkOut(
    @Request() req: ExpressRequest,
    @Path() workLogId: string,
  ): Promise<TsoaSuccessResponse<CheckOutResponseDto>> {
    // JWT에서 userId 추출
    const userId = (req as any).user.id;
    const userIdBuffer = uuidToBuffer(userId);
    const workLogIdBuffer = uuidToBuffer(workLogId);

    // Service 호출 (userId로 권한 검증 포함)
    const result = await WorkLogService.checkOut(workLogIdBuffer, userIdBuffer);

    // 성공 응답 반환
    return new TsoaSuccessResponse(result);
  }
}
