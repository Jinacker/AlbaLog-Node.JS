import { Controller, Get, Route, Tags, Path, Query, SuccessResponse, Response } from 'tsoa';
import SettlementHistoryService from '../service/settlement_history_service';
import { SettlementHistoryResponseDto } from '../DTO/settlement_history_dto';
import { TsoaSuccessResponse } from '../config/response_interface';
import { uuidToBuffer } from '../util/uuid_util';

/**
 * 정산 내역 Controller
 * 설정 > 정산 내역 확인
 */
@Route('api/settlement-history')
@Tags('Settlement History')
export class SettlementHistoryController extends Controller {
  /**
   * 정산 내역 조회 API
   * @param userId 사용자 ID (UUID 문자열)
   * @param status 정산 상태 필터 (all: 전체, waiting: 정산 대기, paid: 정산 완료, unpaid: 미정산)
   * @returns 정산 내역 목록
   */
  @Get('{userId}')
  @SuccessResponse('200', '정산 내역 조회 성공')
  @Response(400, 'Bad Request')
  @Response(404, 'User Not Found')
  @Response(500, 'Internal Server Error')
  public async getSettlementHistory(
    @Path() userId: string,
    @Query() status: 'all' | 'waiting' | 'paid' | 'unpaid' = 'all',
  ): Promise<TsoaSuccessResponse<SettlementHistoryResponseDto>> {
    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      this.setStatus(400);
      throw new Error('유효하지 않은 사용자 ID 형식입니다.');
    }

    // UUID 문자열을 Buffer로 변환
    const userIdBuffer = uuidToBuffer(userId);

    // Service 호출
    const history = await SettlementHistoryService.getSettlementHistory(
      userIdBuffer,
      status,
    );

    return new TsoaSuccessResponse(history);
  }
}
