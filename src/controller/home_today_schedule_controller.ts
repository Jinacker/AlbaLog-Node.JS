import { Controller, Get, Route, Request, Security } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { GET_TODAY_WORK_SUMMARY } from '../service/home_today_schedule_service';
import { TodayWorkSummaryResponse } from '../DTO/alba_schedule_dto';

/**
 * 오늘의 근무 일정 관련 컨트롤러
 * - 홈 화면에서 오늘의 근무 요약 정보를 제공
 */
@Route('works')
export class TodayWorkController extends Controller {

  /**
   * 오늘의 근무 요약 조회 API
   * @summary 오늘 예정된 근무 개수, 총 근무 시간, 예상 수입을 반환
   * @returns {TodayWorkSummaryResponse} 오늘의 근무 요약 정보
   */
  @Get('today/summary')
  @Security('jwt')
  public async getTodaySummary(
    @Request() req: ExpressRequest,
  ): Promise<TodayWorkSummaryResponse> {
    const userId = (req.user as unknown as { id: string }).id;
    return GET_TODAY_WORK_SUMMARY(userId);
  }
}
