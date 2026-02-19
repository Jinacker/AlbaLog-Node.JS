import WorkLogService from './work_log_service';
import { uuidToBin } from '../util/uuid';
import { TodayWorkSummaryResponse } from '../DTO/alba_schedule_dto';

/**
 * 오늘의 근무 요약 정보 조회
 * user_work_log 기반으로 집계하여 오늘의 근무 리스트 API와 동일한 데이터 소스 사용
 * @param userId - 사용자 UUID 문자열
 * @returns 오늘의 근무 요약 응답 DTO
 */
export const GET_TODAY_WORK_SUMMARY = async (userId: string): Promise<TodayWorkSummaryResponse> => {
  const userIdBuffer = uuidToBin(userId);
  const { schedules } = await WorkLogService.getTodaySchedules(userIdBuffer);

  let totalWorkMinutes = 0;
  let expectedIncome = 0;

  for (const s of schedules) {
    totalWorkMinutes += Math.round(s.workHours * 60);
    expectedIncome += s.totalWage;
  }

  return {
    workCount: schedules.length,
    totalWorkMinutes,
    expectedIncome,
  };
};
