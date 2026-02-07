export interface SettlementListResponseDTO {
  items: SettlementListItemDTO[];
  nextCursor?: string; // UUID string (work_log_id 기반 등)
  hasNext: boolean;
}

export interface SettlementListItemDTO {
  work_date: string; // YYYY-MM-DD
  store_name: string;
  work_minutes: number;
  expected_income: number; // work_minutes * hourly_rate / 60
  amount: number; // 실제 수입(합산)
  settlement_status: 'waiting' | 'paid' | 'unpaid';
}
