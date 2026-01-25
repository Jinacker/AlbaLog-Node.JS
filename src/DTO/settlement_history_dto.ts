/**
 * 정산 내역 DTO
 */

/**
 * 정산 내역 항목
 */
export interface SettlementHistoryItemDto {
  /** 근무 날짜 (YYYY-MM-DD) */
  workDate: string;
  /** 매장명 */
  storeName: string;
  /** 근무 시간 (분) */
  workMinutes: number;
  /** 예상 수입 */
  expectedIncome: number;
  /** 실제 수입 */
  actualIncome: number;
  /** 정산 상태 (waiting, paid, unpaid) */
  settlementStatus: string;
}

/**
 * 정산 내역 조회 응답
 */
export interface SettlementHistoryResponseDto {
  /** 정산 내역 목록 */
  settlements: SettlementHistoryItemDto[];
  /** 총 예상 수입 */
  totalExpectedIncome: number;
  /** 총 실제 수입 */
  totalActualIncome: number;
}
