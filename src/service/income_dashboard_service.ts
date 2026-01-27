// income_dashboard_service.ts
import incomeDashboardRepository from '../repository/income_dashboard_repository';
import { uuidToBuffer } from '../util/uuid_util'; // ✅ CHANGED: uuidToBin -> uuidToBuffer

type GroupBy = 'store' | 'category';

export class IncomeDashboardService {
  public async getDashboard(userId: string, month: string, groupBy: GroupBy) {
    // ✅ CHANGED: UUID string -> Uint8Array(실제로는 Buffer지만 타입은 Uint8Array)
    const userIdBin = uuidToBuffer(userId);

    const { start, end, normalizedMonth } = this.getMonthRange(month);

    const [workLogs, userAlbas] = await Promise.all([
      // ✅ CHANGED: 레포가 Uint8Array 받도록 맞출 예정
      incomeDashboardRepository.findWorkLogsForMonth(userIdBin, start, end),
      incomeDashboardRepository.findUserAlbaSettlementStatuses(userIdBin),
    ]);

    const settlementMap = new Map<string, string | null>();
    for (const ua of userAlbas) {
      // Bytes(hex 키) 통일 위해 Buffer로 감싸서 hex 생성
      settlementMap.set(Buffer.from(ua.alba_id as any).toString('hex'), ua.settlement_status ?? null);
    }

    let expectedIncome = 0;
    let actualIncome = 0;

    const breakdownMap = new Map<string, number>();

    for (const log of workLogs) {
      const minutes = log.work_minutes ?? 0;
      const hourlyRate = log.alba_posting?.hourly_rate ?? 0;

      if (minutes <= 0 || hourlyRate <= 0) continue;

      const income = Math.round((minutes * hourlyRate) / 60);

      expectedIncome += income;

      const settlement = settlementMap.get(Buffer.from(log.alba_id as any).toString('hex'));

      const isCompleted = settlement === 'COMPLETED';
      if (!isCompleted) continue;

      actualIncome += income;

      if (groupBy === 'store') {
        const storeName = log.alba_posting?.store?.store_name ?? '기타';
        breakdownMap.set(storeName, (breakdownMap.get(storeName) ?? 0) + income);
      } else {
        const cats = log.alba_posting?.store?.store_category ?? [];
        if (cats.length === 0) {
          breakdownMap.set('uncategorized', (breakdownMap.get('uncategorized') ?? 0) + income);
        } else {
          for (const c of cats) {
            const key = String(c.category_id);
            breakdownMap.set(key, (breakdownMap.get(key) ?? 0) + income);
          }
        }
      }
    }

    const breakdown = [...breakdownMap.entries()]
      .map(([key, income]) => ({ key, income }))
      .sort((a, b) => b.income - a.income);

    return {
      month: normalizedMonth,
      expectedIncome,
      actualIncome,
      breakdown,
    };
  }

  private getMonthRange(month?: string) {
    const now = new Date();
    const y = month ? Number(month.slice(0, 4)) : now.getFullYear();
    const m = month ? Number(month.slice(5, 7)) : now.getMonth() + 1;

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);

    const normalizedMonth = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}`;
    return { start, end, normalizedMonth };
  }
}

export default new IncomeDashboardService();
