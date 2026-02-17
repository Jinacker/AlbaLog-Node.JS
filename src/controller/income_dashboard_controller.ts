import {
  Controller,
  Get,
  Query,
  Route,
  Security,
  Tags,
  Request,
  SuccessResponse,
  Response,
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import IncomeDashboardService from '../service/income_dashboard_service';
import { IncomeDashboardResponseDTO } from '../DTO/income_dashboard_dto';
import { TsoaSuccessResponse, TsoaFailResponse } from '../config/response_interface'; // 경로 맞게
//import { ITsoaErrorResponse } from '../config/response_interface';

@Route('income')
@Tags('Income Dashboard')
export class IncomeDashboardController extends Controller {
  /**
   * 수입 대시보드 조회
   *
   * - incomeGoal: 사용자 수입 목표
   * - expectedIncome: 근무시간 × 시급 (정산 여부 무관)
   * - actualIncome: 정산 완료된 수입
   * - incomeChangeRate: 전월 대비 수입 증감률 (%)
   * - breakdown: 브랜드별 실제 수입
   *
   * @param month 조회 월 (YYYY-MM), 생략 시 이번 달
   */
  @Get('dashboard')
  @Security('jwt')
  @SuccessResponse('200', '수입 대시보드 조회 성공')
  @Response<TsoaFailResponse<null>>(401, 'Unauthorized', {
    resultType: 'FAIL' as any,
    error: { errorCode: 'UNAUTHORIZED', errorMessage: '인증이 필요합니다.' },
    success: null,
  })
  @Response<TsoaFailResponse<null>>(500, 'Internal Server Error', {
    resultType: 'FAIL' as any,
    error: { errorCode: 'INTERNAL_SERVER_ERROR', errorMessage: '서버 내부 오류가 발생했습니다.' },
    success: null,
  })
  public async getDashboard(
    @Request() req: ExpressRequest,
    @Query() month?: string,
  ): Promise<TsoaSuccessResponse<IncomeDashboardResponseDTO>> {
    const userUuid = (req as any).user?.id as string;

    const data = await IncomeDashboardService.getDashboard(userUuid, month ?? '');

    return new TsoaSuccessResponse<IncomeDashboardResponseDTO>(data);
  }
}
