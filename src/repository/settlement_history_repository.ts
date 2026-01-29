import prisma from '../config/prisma';
import { user_alba_settlement_status } from '@prisma/client';

/**
 * 정산 내역 Repository
 */
class SettlementHistoryRepository {
  /**
   * 사용자의 정산 내역 조회
   * @param userId 사용자 ID (Buffer)
   * @param status 정산 상태 필터 (all, waiting, paid, unpaid)
   */
  async findSettlementHistory(userId: Uint8Array, status: string) {
    const whereClause: {
      user_id: Uint8Array<ArrayBuffer>;
      settlement_status?: user_alba_settlement_status;
    } = {
      user_id: userId as Uint8Array<ArrayBuffer>,
    };

    // 상태 필터링
    if (status !== 'all') {
      whereClause.settlement_status = status as user_alba_settlement_status;
    }

    return await prisma.user_alba.findMany({
      where: whereClause,
      include: {
        alba_posting: {
          include: {
            store: true,
            work_schedule: true,
          },
        },
      },
    });
  }

  /**
   * income_log에서 실제 수입 조회 (alba_id 포함)
   * @param userId 사용자 ID
   */
  async findIncomeByUser(userId: Uint8Array) {
    return await prisma.income_log.findMany({
      where: {
        user_id: userId as Uint8Array<ArrayBuffer>,
      },
      select: {
        user_work_log_id: true,
        amount: true,
        user_work_log: {
          select: {
            alba_id: true,
          },
        },
      },
    });
  }
}

export default new SettlementHistoryRepository();
