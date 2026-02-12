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

    // 3. work_log용 시간 데이터 파싱
    const workLogData = this.parseWorkLogData(data.workDate, data.startTime, data.endTime);

    // 4. 데이터베이스에 일정 + work_log 저장 (트랜잭션)
    const scheduleData = {
      user_id: userId,
      workplace: data.workplace,
      work_date: data.workDate,
      work_time: workTime,
      hourly_wage: data.hourlyWage,
      memo: data.memo,
    };

    const schedule = await ScheduleRepository.createScheduleWithWorkLog(scheduleData, workLogData);

    // 5. DTO 형식으로 반환
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
   * 일정 데이터를 work_log용 Date 객체로 변환
   */
  private parseWorkLogData(
    workDate: string,
    startTime: string,
    endTime: string,
  ): { workDate: Date; startTime: Date | null; endTime: Date | null; workMinutes: number | null } {
    // work_date는 Date 타입이므로 UTC midnight으로 저장하여 날짜가 밀리지 않도록 처리
    const date = new Date(workDate + 'T00:00:00Z');

    const [sh, sm] = startTime.split(':').map(Number);
    const start = new Date(workDate + `T${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}:00+09:00`);

    const [eh, em] = endTime.split(':').map(Number);
    const end = new Date(workDate + `T${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}:00+09:00`);

    // 야간 근무 (종료 시간이 시작 시간보다 이전)
    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }

    const workMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

    return { workDate: date, startTime: start, endTime: end, workMinutes };
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
