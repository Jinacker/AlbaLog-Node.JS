// income_dashboard_service.ts
import { incomeDashboardRepository } from '../repository/income_dashboard_repository';

type GroupBy = 'store' | 'category';

export class IncomeDashboardService {
  public async getDashboard(userId: Buffer, month: string, groupBy: GroupBy) {
    const { start, end, normalizedMonth } = this.getMonthRange(month);

    const [workLogs, userAlbas] = await Promise.all([
      incomeDashboardRepository.findWorkLogsForMonth(userId, start, end),
      incomeDashboardRepository.findUserAlbaSettlementStatuses(userId),
    ]);

    // alba_id -> settlement_status
    const settlementMap = new Map<string, string | null>();
    for (const ua of userAlbas) {
      settlementMap.set(ua.alba_id.toString('hex'), ua.settlement_status ?? null);
    }

    let expectedIncome = 0;
    let actualIncome = 0;

    const breakdownMap = new Map<string, number>();

    for (const log of workLogs) {
      const minutes = log.work_minutes ?? 0;
      const hourlyRate = log.alba_posting?.hourly_rate ?? 0;

      if (minutes <= 0 || hourlyRate <= 0) continue;

      // 분 단위 시급 계산 (정수 원 단위로 반올림/버림 정책 필요)
      const income = Math.round((minutes * hourlyRate) / 60);

      expectedIncome += income;

      const settlement = settlementMap.get(log.alba_id.toString('hex'));

      const isCompleted = settlement === 'COMPLETED'; // ✅ enum 값 너희 프로젝트에 맞춰 수정
      if (!isCompleted) continue;

      actualIncome += income;

      // breakdown
      if (groupBy === 'store') {
        const storeName = log.alba_posting?.store?.store_name ?? '기타';
        breakdownMap.set(storeName, (breakdownMap.get(storeName) ?? 0) + income);
      } else {
        // category: 가게가 여러 카테고리면 여러번 더해짐(중복 집계 가능)
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
    // month: "YYYY-MM" 형태 기대
    const now = new Date();
    const y = month ? Number(month.slice(0, 4)) : now.getFullYear();
    const m = month ? Number(month.slice(5, 7)) : now.getMonth() + 1;

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1); // 다음달 1일 (lt end)

    const normalizedMonth = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}`;

    return { start, end, normalizedMonth };
  }
}

export default new IncomeDashboardService();
