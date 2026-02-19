import prisma from '../config/prisma';
import { user_alba_schedule_day_of_week } from '../../node_modules/.prisma/client';

/**
 * 오늘의 근무 스케줄 조회 결과 인터페이스
 */
export interface TodayWorkSchedule {
  start_time: Date;
  end_time: Date;
  hourly_wage: number;
  workplace: string;
}

/**
 * 근무 스케줄 관련 Repository
 * - user_alba_schedule 테이블 조회
 */
class WorkRepository {
  /**
   * 오늘 요일에 해당하는 사용자의 근무 스케줄 조회
   * @param userId - 사용자 UUID (문자열)
   * @param todayDayOfWeek - 오늘 요일 (MON, TUE, WED, THU, FRI, SAT, SUN)
   * @returns 오늘의 근무 스케줄 목록
   */
  async findTodayWorks(
    userId: string,
    todayDayOfWeek: string,
  ): Promise<TodayWorkSchedule[]> {
    // UUID 문자열을 Buffer로 변환 (하이픈 제거 후 16바이트 바이너리)
    const userIdBuffer = Buffer.from(userId.replace(/-/g, ''), 'hex');

    // 오늘 날짜 문자열 (YYYY-MM-DD, 로컬 시간 기준)
    const now = new Date();
    const todayDateStr = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');

    // repeat_days 비트마스크에서 오늘 인덱스 (SUN=0, MON=1, ..., SAT=6)
    const todayBitIndex = now.getDay();

    // 오늘 해당할 수 있는 모든 스케줄 후보 조회
    const schedules = await prisma.user_alba_schedule.findMany({
      where: {
        user_id: userIdBuffer,
        OR: [
          { repeat_type: 'daily' },                                              // 매일 반복
          { day_of_week: todayDayOfWeek as user_alba_schedule_day_of_week },     // 요일 직접 지정
          { repeat_type: 'weekly' },                                              // 주간 반복 (비트마스크로 후처리)
          { repeat_type: 'biweekly' },                                            // 격주 반복 (비트마스크로 후처리)
          { work_date: todayDateStr },                                            // 일회성 일정 (오늘 날짜)
        ],
      },
    });

    // work_time 문자열을 파싱하여 Date 객체로 변환
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return schedules
      .filter((schedule) => {
        if (!schedule.work_time || !schedule.hourly_wage) return false;

        const rt = schedule.repeat_type;

        // 매일 반복
        if (rt === 'daily') return true;

        // 요일 직접 지정
        if (schedule.day_of_week === todayDayOfWeek) return true;

        // 주간/격주: repeat_days 비트마스크로 오늘 포함 여부 확인
        if ((rt === 'weekly' || rt === 'biweekly') && schedule.repeat_days) {
          return schedule.repeat_days[todayBitIndex] === '1';
        }

        // 일회성(none 또는 repeat_type 없음): work_date가 오늘인지 확인
        return schedule.work_date === todayDateStr;
      })
      .map((schedule) => {
        const { startTime, endTime } = this.parseWorkTime(
          schedule.work_time!,
          today,
        );

        return {
          start_time: startTime,
          end_time: endTime,
          hourly_wage: schedule.hourly_wage!,
          workplace: schedule.workplace || '',
        };
      });
  }

  /**
   * work_time 문자열을 Date 객체로 파싱
   * @param workTime - "09:00-18:00" 형식의 문자열
   * @param baseDate - 기준 날짜
   * @returns 시작/종료 시간 Date 객체
   */
  private parseWorkTime(
    workTime: string,
    baseDate: Date,
  ): { startTime: Date; endTime: Date } {
    // "09:00-18:00" 형식 파싱
    const [startStr, endStr] = workTime.split('-');
    const [startHour, startMin] = startStr.split(':').map(Number);
    const [endHour, endMin] = endStr.split(':').map(Number);

    const startTime = new Date(baseDate);
    startTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date(baseDate);
    endTime.setHours(endHour, endMin, 0, 0);

    // 종료 시간이 시작 시간보다 이전이면 다음날로 처리 (야간 근무)
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    return { startTime, endTime };
  }
}

export default new WorkRepository();