import WorkRepository from '../repository/work_repository';
import { TodayWorkSummaryResponse } from '../DTO/alba_schedule_dto';

/**
 * // 오늘의 근무 요약 정보 조회
 * // 오늘 예정된 근무 개수, 총 근무 시간, 예상 수입 계산
 * @param userId  //  사용자 UUID 문자열
 * @returns  // 오늘의 근무 요약 응답 DTO
 */

export const GET_TODAY_WORK_SUMMARY = async ( userId: string,): Promise<TodayWorkSummaryResponse> => {
  // == 오늘 요일 구하기 = > (MON, TUE, WED, THU, FRI, SAT, SUN) == 
  const todayDayOfWeek = GET_TODAY_DAY_OF_WEEK();

  // == Repository에서 오늘의 근무 스케줄 조회 == 
  const works = await WorkRepository.findTodayWorks(userId, todayDayOfWeek);

  // == 총 근무 시간 및 예상 수입 계산 == 
  let totalWorkMinutes = 0;
  let expectedIncome = 0;

  for (const work of works) {
    // 근무 시간 계산 (분 단위)
    const minutes = CALCULATE_WORK_MINUTES(work.start_time, work.end_time);

    totalWorkMinutes += minutes;
    // 예상 수입 = (근무 시간 / 60) * 시급, 소수점 버림
    expectedIncome += Math.floor((minutes / 60) * work.hourly_wage);
  }

  // == 응답 DTO 반환 == 
  return {
    workCount: works.length,
    totalWorkMinutes,
    expectedIncome,
  };
};

// ===== Helper Functions =====

/**
 * 오늘 요일을 DB enum 형식으로 반환
 * @returns 요일 문자열 (MON, TUE, WED, THU, FRI, SAT, SUN)
 */
const GET_TODAY_DAY_OF_WEEK = (): string => {
  const dayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const today = new Date();
  return dayMap[today.getDay()];
};

/**
 * 두 시간 사이의 근무 시간을 분 단위로 계산
 * @param start - 근무 시작 시간
 * @param end - 근무 종료 시간
 * @returns 근무 시간 (분)
 */
const CALCULATE_WORK_MINUTES = (start: Date, end: Date): number =>
  Math.max(0, (end.getTime() - start.getTime()) / 60000);
