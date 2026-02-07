import SettlementHistoryRepository from '../repository/settlement_history_repository';
import {
  SettlementHistoryResponseDto,
  SettlementHistoryItemDto,
} from '../DTO/settlement_history_dto';
import { formatDate } from '../util/date_util';

/**
 * 정산 내역 Service
 */
class SettlementHistoryService {
  /**
   * 정산 내역 조회
   * @param userId 사용자 ID (Buffer)
   * @param status 정산 상태 필터 (all, waiting, paid, unpaid)
   */
  async getSettlementHistory(
    userId: Uint8Array,
    status: string,
  ): Promise<SettlementHistoryResponseDto> {
    // 정산 내역 조회
    const settlements = await SettlementHistoryRepository.findSettlementHistory(
      userId,
      status,
    );

    // income_log에서 실제 수입 조회 (alba_id 기준으로 매핑)
    const incomes = await SettlementHistoryRepository.findIncomeByUser(userId);
    const incomeMap = new Map<string, number>();
    for (const income of incomes) {
      // alba_id를 키로 사용하여 매핑
      const albaId = income.user_work_log?.alba_id;
      if (albaId) {
        const key = Buffer.from(albaId).toString('hex');
        // 같은 alba_id에 대한 수입은 합산
        const existing = incomeMap.get(key) || 0;
        incomeMap.set(key, existing + (income.amount || 0));
      }
    }

    // DTO 변환
    let totalExpectedIncome = 0;
    let totalActualIncome = 0;

    const items: SettlementHistoryItemDto[] = settlements.map((item) => {
      const workSchedule = item.alba_posting.work_schedule;
      const hourlyRate = item.alba_posting.hourly_rate || 0;

      // 근무 시간 계산 (분)
      let workMinutes = 0;
      if (workSchedule?.start_time && workSchedule?.end_time) {
        const start = new Date(workSchedule.start_time);
        const end = new Date(workSchedule.end_time);
        workMinutes = Math.max(0, (end.getTime() - start.getTime()) / 60000);
      }

      // 예상 수입 계산
      const expectedIncome = Math.floor((workMinutes / 60) * hourlyRate);
      totalExpectedIncome += expectedIncome;

      // 실제 수입 (income_log에서 가져오거나 0)
      let actualIncome = 0;
      if (item.alba_id) {
        const albaIdHex = Buffer.from(item.alba_id).toString('hex');
        actualIncome = incomeMap.get(albaIdHex) || 0;
      }
      totalActualIncome += actualIncome;

      return {
        workDate: workSchedule?.work_date
          ? formatDate(workSchedule.work_date)
          : '',
        storeName: item.alba_posting.store?.store_name || '',
        workMinutes,
        expectedIncome,
        actualIncome,
        settlementStatus: item.settlement_status || 'waiting',
      };
    });

    return {
      settlements: items,
      totalExpectedIncome,
      totalActualIncome,
    };
  }
}

export default new SettlementHistoryService();
