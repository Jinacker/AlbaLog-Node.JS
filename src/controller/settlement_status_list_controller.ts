import {
  Controller,
  Get,
  Route,
  Request,
  Tags,
  Query,
  SuccessResponse,
  Response,
  Security,
} from 'tsoa';
import { SettlementListResponseDTO } from '../DTO/settlement_status_list_dto';
import { Request as ExpressRequest } from 'express';
import { settlementStatusListService } from '../service/settlement_status_list_service';

/**
 * settlement Controller
 * 내 정산 상태 목록 조회
 * - status로 탭 필터
 * - sort로 정렬
 */

export type SettlementStatusQuery = 'all' | 'waiting' | 'paid' | 'unpaid';
export type SettlementSortQuery = 'latest' | 'oldest';

@Route('api/settlement-status-list')
@Tags('settlement status list')
@Security('jwt')
export class SettlementStatusListController extends Controller {
  /**
   * 내 정산 상태 목록 조회
   * @param status 탭 필터 (all | waiting | paid | unpaid)
   * @param sort 정렬 방식 (latest | oldest)
   * @param cursor 커서(페이징)
   * @param size 페이지 크기
   * @returns 정산 상태 목록
   */
  @Get()
  @SuccessResponse('200', '정산 상태 목록 조회 성공')
  @Response(401, 'Unauthorized')
  @Response(500, 'Internal Server Error')
  public async getMysettlements(
    @Request() req: ExpressRequest,
    @Query() status: SettlementStatusQuery = 'all',
    @Query() sort: SettlementSortQuery = 'latest',
    @Query() cursor?: string,
    @Query() size: number = 20,
  ): Promise<SettlementListResponseDTO> {
    const userId: string | undefined = (req as any).userId ?? (req as any).user?.id;

    if (!userId) {
      this.setStatus(401);
      return { items: [], hasNext: false };
    }

    return settlementStatusListService.listMySettlements(userId, {
      status,
      sort,
      cursor,
      size,
    });
  }
}
