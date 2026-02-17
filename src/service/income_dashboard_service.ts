import incomeDashboardRepository from '../repository/income_dashboard_repository';
import { IncomeDashboardResponseDTO } from '../DTO/income_dashboard_dto';
import { uuidToBuffer } from '../util/uuid_util';
import { user_alba_settlement_status } from '@prisma/client';

export class IncomeDashboardService {
  public async getDashboard(userId: string, month: string): Promise<IncomeDashboardResponseDTO> {
    const userIdBin = uuidToBuffer(userId);

    const { start, end, normalizedMonth } = this.getMonthRange(month);

    // 전월 month + range 계산
    const previousMonth = this.getPreviousMonth(normalizedMonth);
    const { start: prevStart, end: prevEnd } = this.getMonthRange(previousMonth);

    const [workLogs, prevWorkLogs, userAlbas, user] = await Promise.all([
      incomeDashboardRepository.findWorkLogsForMonth(userIdBin, start, end),
      incomeDashboardRepository.findWorkLogsForMonth(userIdBin, prevStart, prevEnd),
      incomeDashboardRepository.findUserAlbaSettlementStatuses(userIdBin),
      incomeDashboardRepository.findUserIncomeGoal(userIdBin),
    ]);

    const incomeGoal = user?.income_goal ?? 0;

    const settlementMap: Map<string, user_alba_settlement_status | null> = new Map();
    for (const ua of userAlbas) {
      settlementMap.set(Buffer.from(ua.alba_id).toString('hex'), ua.settlement_status ?? null);
    }

    const current = this.calculateMonthlyIncome(workLogs, settlementMap);
    const prev = this.calculateMonthlyIncome(prevWorkLogs, settlementMap);

    // 전월 대비 증감률(%)
    // 전월 actualIncome이 0이면 0으로
    const incomeChangeRate =
      prev.actualIncome > 0
        ? ((current.actualIncome - prev.actualIncome) / prev.actualIncome) * 100
        : 0;

    return {
      month: normalizedMonth,
      incomeGoal,
      expectedIncome: current.expectedIncome,
      actualIncome: current.actualIncome,
      breakdown: current.breakdown,
      incomeChangeRate,
    };
  }

  // 월별 expected/actual/breakdown 계산 공통 함수
  private calculateMonthlyIncome(
    workLogs: any[],
    settlementMap: Map<string, user_alba_settlement_status | null>,
  ) {
    let expectedIncome = 0;
    let actualIncome = 0;

    const breakdownMap = new Map<string, number>();

    for (const log of workLogs) {
      const minutes = log.work_minutes ?? 0;
      const hourlyRate = log.alba_posting?.hourly_rate ?? 0;

      if (minutes <= 0 || hourlyRate <= 0) continue;

      const income = Math.round((minutes * hourlyRate) / 60);
      expectedIncome += income;

      const settlement = settlementMap.get(Buffer.from(log.alba_id).toString('hex')) ?? null;
      const isCompleted = settlement === user_alba_settlement_status.paid;
      if (!isCompleted) continue;

      actualIncome += income;

      const rawStoreName = log.alba_posting?.store?.store_name ?? '기타';
      const brandName = this.extractBrandName(rawStoreName);

      breakdownMap.set(brandName, (breakdownMap.get(brandName) ?? 0) + income);
    }

    const breakdown = [...breakdownMap.entries()]
      .map(([key, income]) => ({ key, income }))
      .sort((a, b) => b.income - a.income);

    return { expectedIncome, actualIncome, breakdown };
  }

  private getPreviousMonth(month: string): string {
    const [year, mon] = month.split('-').map(Number);
    const date = new Date(year, mon - 2); // 전월
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
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

  private extractBrandName(storeName: string): string {
    if (!storeName) return '기타';

    let name = storeName.trim();
    name = name.replace(/\(.*?\)/g, '').trim(); // 괄호 제거
    name = name.replace(/(점|지점|점포)$/g, '').trim(); // 접미 제거

    const firstToken = name.split(/\s+/)[0];
    return firstToken || '기타';
  }
}

export default new IncomeDashboardService();
