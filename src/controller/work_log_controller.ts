import { Controller, Get, Route, Tags, SuccessResponse, Response, Request, Security } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import WorkLogService from '../service/work_log_service';
import { TodayWorkListResponseDto } from '../DTO/work_log_dto';
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
}
