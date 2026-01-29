import WorkLogRepository from '../repository/work_log_repository';
import { TodayScheduleResponseDto, TodayWorkListResponseDto } from '../DTO/work_log_dto';
import { bufferToUuid } from '../util/uuid_util';
import { formatDate } from '../util/date_util';

/**
 * 근무 상태 라벨 매핑
 */
const STATUS_LABELS: Record<string, string> = {
  scheduled: '예정',
  working: '근무 중',
  done: '근무 완료',
  settled: '정산 완료',
};

/**
 * Work Log Service
 * 근무 기록 관련 비즈니스 로직 처리
 */
class WorkLogService {
  /**
   * 오늘의 근무 리스트 조회 (user_work_log 기반)
   * @param userId - 사용자 ID (Buffer 형식)
   * @returns 오늘의 근무 리스트
   */
  async getTodaySchedules(userId: Uint8Array): Promise<TodayWorkListResponseDto> {
    const today = new Date();

    // Repository에서 오늘 날짜의 work_log 가져오기
    const workLogs = await WorkLogRepository.findWorkLogsByDate(userId, today);

    // DTO 형식으로 변환
    const scheduleDtos: TodayScheduleResponseDto[] = workLogs.map((log) => {
      const { startTime, endTime, workHours } = this.parseWorkLogTime(
        log.start_time,
        log.end_time,
        log.work_minutes,
      );

      const hourlyWage = log.alba_posting.hourly_rate || 0;
      const totalWage = Math.round(hourlyWage * workHours);
      const status = log.status || 'scheduled';

      return {
        workLogId: bufferToUuid(log.user_work_log_id),
        status,
        statusLabel: STATUS_LABELS[status] || '알 수 없음',
        workplace: log.alba_posting.store.store_name || '',
        startTime,
        endTime,
        workHours,
        hourlyWage,
        totalWage,
      };
    });

    return {
      date: formatDate(today),
      schedules: scheduleDtos,
      totalCount: scheduleDtos.length,
    };
  }

  /**
   * work_log의 시간 정보 파싱
   * @param startTime - 시작 시간 (DateTime)
   * @param endTime - 종료 시간 (DateTime)
   * @param workMinutes - 근무 시간 (분)
   * @returns 파싱된 시간 정보
   */
  private parseWorkLogTime(
    startTime: Date | null,
    endTime: Date | null,
    workMinutes: number | null,
  ): {
    startTime: string;
    endTime: string;
    workHours: number;
  } {
    const formatTime = (date: Date | null): string => {
      if (!date) return '';
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    const startTimeStr = formatTime(startTime);
    const endTimeStr = formatTime(endTime);

    // work_minutes가 있으면 사용, 없으면 시간으로 계산
    let workHours = 0;
    if (workMinutes) {
      workHours = Math.round((workMinutes / 60) * 10) / 10;
    } else if (startTime && endTime) {
      const diffMs = endTime.getTime() - startTime.getTime();
      workHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
    }

    return { startTime: startTimeStr, endTime: endTimeStr, workHours };
  }
}

export default new WorkLogService();
