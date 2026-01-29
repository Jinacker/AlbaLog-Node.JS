/**
 * 오늘의 근무 스케줄 응답 DTO
 */
export interface TodayScheduleResponseDto {
  workLogId: string;
  status: 'scheduled' | 'working' | 'done' | 'settled';
  statusLabel: string; // "예정", "근무 중", "근무 완료", "정산 완료"
  workplace: string; // "CU 홍대 점"
  startTime: string; // "14:00"
  endTime: string; // "18:00"
  workHours: number; // 4
  hourlyWage: number; // 11000
  totalWage: number; // 44000
}

/**
 * 오늘의 근무 리스트 전체 응답 DTO
 */
export interface TodayWorkListResponseDto {
  date: string; // "2026-01-24"
  schedules: TodayScheduleResponseDto[];
  totalCount: number;
}
