// income_dashboard_service.ts
import incomeDashboardRepository from '../repository/income_dashboard_repository'; // ✅ (default import 유지)
import { uuidToBin } from '../util/uuid';

type GroupBy = 'store' | 'category';

export class IncomeDashboardService {
  // ✅ CHANGED: userId는 UUID 문자열
  public async getDashboard(userId: string, month: string, groupBy: GroupBy) {
    // ✅ CHANGED: UUID string -> Buffer(16)
    const userIdBin = uuidToBin(userId);

    const { start, end, normalizedMonth } = this.getMonthRange(month);

    const [workLogs, userAlbas] = await Promise.all([
      incomeDashboardRepository.findWorkLogsForMonth(userIdBin, start, end),
      incomeDashboardRepository.findUserAlbaSettlementStatuses(userIdBin),
    ]);

    // alba_id -> settlement_status
    const settlementMap = new Map<string, string | null>();
    for (const ua of userAlbas) {
      // ua.alba_id 가 Bytes면 Buffer일 가능성이 큼. Buffer면 toString('hex') 가능.
      settlementMap.set(Buffer.from(ua.alba_id as any).toString('hex'), ua.settlement_status ?? null); // ✅ CHANGED(안전)
    }

    let expectedIncome = 0;
    let actualIncome = 0;

    const breakdownMap = new Map<string, number>();

    for (const log of workLogs) {
      const minutes = log.work_minutes ?? 0;
      const hourlyRate = log.alba_posting?.hourly_rate ?? 0; // ✅ 이제 타입 에러 안 남

      if (minutes <= 0 || hourlyRate <= 0) continue;

      const income = Math.round((minutes * hourlyRate) / 60);

      expectedIncome += income;

      const settlement = settlementMap.get(Buffer.from(log.alba_id as any).toString('hex')); // ✅ CHANGED(안전)

      const isCompleted = settlement === 'COMPLETED'; // enum 값은 너희 프로젝트에 맞춰
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
