import ScheduleRepository from '../repository/schedule_repository';
import { CreateScheduleRequestDto, ScheduleResponseDto } from '../DTO/schedule_dto';

/**
 * Schedule Service
 * 알바 일정 관련 비즈니스 로직 처리
 */
class ScheduleService {
  /**
   * 새 알바 일정 생성 (홈화면 간단 추가)
   * @param userId - 사용자 ID (Buffer 형식)
   * @param data - 일정 생성 요청 데이터
   * @returns 생성된 일정 정보
   */
  async createSchedule(
    userId: Uint8Array,
    data: CreateScheduleRequestDto,
  ): Promise<ScheduleResponseDto> {
    // 1. 근무 시간 문자열 생성 (예: "14:00-18:00")
    const workTime = `${data.startTime}-${data.endTime}`;

    // 2. 예상 금액 계산
    const estimatedWage = this.calculateEstimatedWage(
      data.startTime,
      data.endTime,
      data.hourlyWage,
    );

    // 3. 데이터베이스에 일정 저장
    const schedule = await ScheduleRepository.createSchedule({
      user_id: userId,
      workplace: data.workplace,
      work_date: data.workDate,
      work_time: workTime,
      hourly_wage: data.hourlyWage,
      memo: data.memo,
    });

    // 4. DTO 형식으로 반환
    return {
      scheduleId: this.bufferToUuid(schedule.user_alba_schedule_id),
      workplace: schedule.workplace || '',
      workDate: schedule.work_date || '',
      workTime: schedule.work_time || '',
      hourlyWage: schedule.hourly_wage || 0,
      estimatedWage: estimatedWage,
      memo: schedule.memo || '',
    };
  }

  /**
   * 예상 금액 계산
   * 시작 시간과 종료 시간을 기반으로 근무 시간을 계산하고 시급을 곱함
   * @param startTime - 시작 시간 (예: "14:00")
   * @param endTime - 종료 시간 (예: "18:00")
   * @param hourlyWage - 시급
   * @returns 예상 금액
   */
  private calculateEstimatedWage(
    startTime: string,
    endTime: string,
    hourlyWage: number,
  ): number {
    // 시간 파싱 (HH:MM 형식)
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    // 분 단위로 변환
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // 근무 시간 계산 (시간 단위)
    const workHours = (endMinutes - startMinutes) / 60;

    // 예상 금액 계산 (소수점 이하 버림)
    return Math.floor(workHours * hourlyWage);
  }

  /**
   * Buffer(Binary UUID)를 문자열 UUID로 변환
   * @param buffer - Uint8Array 형식의 UUID
   * @returns 문자열 UUID
   */
  private bufferToUuid(buffer: Uint8Array): string {
    const hex = Buffer.from(buffer).toString('hex');
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
  }
}

export default new ScheduleService();
