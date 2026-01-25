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

    // 오늘 요일과 일치하거나 매일 반복되는 스케줄 조회
    const schedules = await prisma.user_alba_schedule.findMany({
      where: {
        user_id: userIdBuffer,
        OR: [
          { day_of_week: todayDayOfWeek as user_alba_schedule_day_of_week }, // 오늘 요일과 일치
          { repeat_type: 'daily' },               // 매일 반복
        ],
      },
    });

    // work_time 문자열을 파싱하여 Date 객체로 변환
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return schedules
      .filter((schedule) => schedule.work_time && schedule.hourly_wage)
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