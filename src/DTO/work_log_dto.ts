/**
 * 오늘의 근무 스케줄 응답 DTO
 */
export interface TodayScheduleResponseDto {
  workLogId: string;
  status: 'scheduled' | 'working' | 'done' | 'settled' | 'absent';
  statusLabel: string; // "예정", "근무 중", "근무 완료", "정산 완료", "결근"
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

/**
 * 출근하기 응답 DTO
 */
export interface CheckInResponseDto {
  workLogId: string;
  status: 'working';
  statusLabel: string; // "근무 중"
  message: string; // "출근 처리되었습니다."
}

/**
 * 퇴근하기 응답 DTO
 */
export interface CheckOutResponseDto {
  workLogId: string;
  status: 'done';
  statusLabel: string; // "근무 완료"
  message: string; // "퇴근 처리되었습니다."
}
