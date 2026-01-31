export interface IncomeBrandBreakdownDTO {
  /** 브랜드명 (예: "CU", "메가커피") */
  key: string;

  /** 해당 브랜드에서 벌어들인 수입 (원) */
  income: number;
}

export interface IncomeDashboardResponseDTO {
  /** 조회 월 (YYYY-MM) */
  month: string;

  /** 사용자의 수입 목표 (원). 설정 안 했으면 0 */
  incomeGoal: number;

  /** 예상 수입: 정산 상태 무관, 근무시간 * 시급 합 */
  expectedIncome: number;

  /** 실제 수입(현재 수입): 정산 완료된 알바 수입 합 */
  actualIncome: number;

  /** 브랜드별 실제 수입 분해표 (actualIncome 대상) */
  breakdown: IncomeBrandBreakdownDTO[];
}
