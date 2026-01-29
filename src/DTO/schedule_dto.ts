/**
 * Schedule DTO
 * 알바 일정 관련 데이터 전송 객체
 */

/**
 * 새 알바 일정 추가 요청 DTO
 * 홈화면 간단 추가 버튼에서 사용
 */
export interface CreateScheduleRequestDto {
  /** 근무지 이름 (예: "CU 홍대점") */
  workplace: string;

  /** 근무 날짜 (예: "2025-11-17") */
  workDate: string;

  /** 근무 시작 시간 (예: "14:00") */
  startTime: string;

  /** 근무 종료 시간 (예: "18:00") */
  endTime: string;

  /** 시급 (예: 11000) */
  hourlyWage: number;

  /** 메모 (선택사항) */
  memo?: string;
}

/**
 * 알바 일정 응답 DTO
 */
export interface ScheduleResponseDto {
  /** 일정 ID (UUID 문자열) */
  scheduleId: string;

  /** 근무지 이름 */
  workplace: string;

  /** 근무 날짜 */
  workDate: string;

  /** 근무 시간 (예: "14:00-18:00") */
  workTime: string;

  /** 시급 */
  hourlyWage: number;

  /** 예상 금액 (시급 * 근무시간) */
  estimatedWage: number;

  /** 메모 */
  memo: string;
}
