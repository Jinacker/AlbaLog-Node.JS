export interface TodayWorkSummaryResponse {
  workCount: number;          // 오늘 근무 개수 (2건)
  totalWorkMinutes: number;   // 총 근무 시간 (분 단위, 예: 360)
  expectedIncome: number;     // 예상 수입 (원 단위, 예: 66000)
}
