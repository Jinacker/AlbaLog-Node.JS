import { SettlementListResponseDTO } from '../DTO/settlement_status_list_dto';
import {
  SettlementStatusQuery,
  SettlementSortQuery,
} from '../controller/settlement_status_list_controller';
import { settlementStatusListRepository } from '../repository/settlement_status_list_repository';

interface ListMySettlementsParams {
  status: SettlementStatusQuery;
  sort: SettlementSortQuery;
  cursor?: string;
  size: number;
}

class SettlementStatusListService {
  /**
   * 내 정산 상태 목록 조회
   */
  public async listMySettlements(
    userId: string,
    params: ListMySettlementsParams,
  ): Promise<SettlementListResponseDTO> {
    const { status, sort, cursor, size } = params;

    const settlementStatusFilter = status === 'all' ? undefined : status;

    const pageSize = Math.min(size, 20);

    const result = await settlementStatusListRepository.findMySettlements({
      userId,
      settlementStatus: settlementStatusFilter,
      sort,
      cursor,
      size: pageSize,
    });

    return {
      items: result.items,
      hasNext: result.hasNext,
      nextCursor: result.nextCursor,
    };
  }
}

export const settlementStatusListService = new SettlementStatusListService();
