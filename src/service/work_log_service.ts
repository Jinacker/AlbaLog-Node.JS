import WorkLogRepository from '../repository/work_log_repository';
import prisma from '../config/prisma';
import {
  TodayScheduleResponseDto,
  TodayWorkListResponseDto,
  CheckInResponseDto,
  CheckOutResponseDto,
} from '../DTO/work_log_dto';
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
  absent: '결근',
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

    // alba_posting이 없는 work_log의 schedule 정보를 일괄 조회
    const scheduleIds = workLogs
      .filter((log) => !log.alba_posting && log.user_alba_schedule_id)
      .map((log) => log.user_alba_schedule_id as Uint8Array<ArrayBuffer>);

    const scheduleMap = new Map<string, { workplace: string | null; hourly_wage: number | null }>();
    if (scheduleIds.length > 0) {
      const schedules = await prisma.user_alba_schedule.findMany({
        where: { user_alba_schedule_id: { in: scheduleIds } },
        select: { user_alba_schedule_id: true, workplace: true, hourly_wage: true },
      });
      for (const s of schedules) {
        scheduleMap.set(Buffer.from(s.user_alba_schedule_id).toString('hex'), s);
      }
    }

    // DTO 형식으로 변환
    const scheduleDtos: TodayScheduleResponseDto[] = workLogs.map((log) => {
      const { startTime, endTime, workHours } = this.parseWorkLogTime(
        log.start_time,
        log.end_time,
        log.work_minutes,
      );

      // alba_posting이 있으면 사용, 없으면 schedule에서 fallback
      let storeId: string | null = null;
      let workplace = '';
      let hourlyWage = 0;

      if (log.alba_posting) {
        storeId = bufferToUuid(log.alba_posting.store.store_id);
        workplace = log.alba_posting.store.store_name || '';
        hourlyWage = log.alba_posting.hourly_rate || 0;
      } else if (log.user_alba_schedule_id) {
        const key = Buffer.from(log.user_alba_schedule_id).toString('hex');
        const schedule = scheduleMap.get(key);
        if (schedule) {
          workplace = schedule.workplace || '';
          hourlyWage = schedule.hourly_wage || 0;
        }
      }

      let address = '';
      let category = '';
      let workplaceName: string | null = null;

      if (log.user_alba_schedule) {
        address = log.user_alba_schedule.address || '';
        category = log.user_alba_schedule.category || '';
        workplaceName = log.user_alba_schedule.workplace_name || null;
      }

      const totalWage = Math.round(hourlyWage * workHours);
      const status = log.status || 'scheduled';

      return {
        workLogId: bufferToUuid(log.user_work_log_id),
        storeId,
        status,
        workplaceName,
        statusLabel: STATUS_LABELS[status] || '알 수 없음',
        workplace,
        startTime,
        endTime,
        workHours,
        hourlyWage,
        totalWage,
        address,
        category,
      };
    });

    return {
      date: formatDate(today),
      schedules: scheduleDtos,
      totalCount: scheduleDtos.length,
    };
  }

  /**
   * 출근하기 (status: scheduled → working)
   * @param workLogId - 근무 기록 ID (Buffer)
   * @param userId - 사용자 ID (Buffer) - 권한 검증용
   * @returns 업데이트된 근무 기록 정보
   */
  async checkIn(workLogId: Uint8Array, userId: Uint8Array): Promise<CheckInResponseDto> {
    // 1. 근무 기록 조회
    const workLog = await WorkLogRepository.findById(workLogId);

    if (!workLog) {
      throw new Error('근무 기록을 찾을 수 없습니다.');
    }

    // 2. 권한 검증 (본인의 근무 기록인지 확인)
    if (Buffer.from(workLog.user_id).toString('hex') !== Buffer.from(userId).toString('hex')) {
      throw new Error('본인의 근무 기록만 출근 처리할 수 있습니다.');
    }

    // 3. 상태 검증 (scheduled 상태에서만 출근 가능)
    if (workLog.status !== 'scheduled') {
      throw new Error(`출근할 수 없는 상태입니다. 현재 상태: ${workLog.status}`);
    }

    // 4. 상태 업데이트 (scheduled → working)
    const updatedLog = await WorkLogRepository.updateStatus(workLogId, 'working');

    return {
      workLogId: bufferToUuid(updatedLog.user_work_log_id),
      status: 'working',
      statusLabel: STATUS_LABELS['working'],
      message: '출근 처리되었습니다.',
    };
  }

  /**
   * 퇴근하기 (status: working → done)
   * @param workLogId - 근무 기록 ID (Buffer)
   * @param userId - 사용자 ID (Buffer) - 권한 검증용
   * @returns 업데이트된 근무 기록 정보
   */
  async checkOut(workLogId: Uint8Array, userId: Uint8Array): Promise<CheckOutResponseDto> {
    // 1. 근무 기록 조회
    const workLog = await WorkLogRepository.findById(workLogId);

    if (!workLog) {
      throw new Error('근무 기록을 찾을 수 없습니다.');
    }

    // 2. 권한 검증 (본인의 근무 기록인지 확인)
    if (Buffer.from(workLog.user_id).toString('hex') !== Buffer.from(userId).toString('hex')) {
      throw new Error('본인의 근무 기록만 퇴근 처리할 수 있습니다.');
    }

    // 3. 상태 검증 (working 상태에서만 퇴근 가능)
    if (workLog.status !== 'working') {
      throw new Error(`퇴근할 수 없는 상태입니다. 현재 상태: ${workLog.status}`);
    }

    // 4. 상태 업데이트 (working → done)
    const updatedLog = await WorkLogRepository.updateStatus(workLogId, 'done');

    return {
      workLogId: bufferToUuid(updatedLog.user_work_log_id),
      status: 'done',
      statusLabel: STATUS_LABELS['done'],
      message: '퇴근 처리되었습니다.',
    };
  }

  /**
   * 퇴근 시간이 지난 working 상태 → done으로 일괄 변경
   * 스케줄러에서 호출
   * @returns 업데이트된 근무 기록 수
   */
  async autoCheckOutExpiredLogs(): Promise<number> {
    // 1. 퇴근 시간이 지난 working 상태 조회
    const expiredLogs = await WorkLogRepository.findExpiredWorkingLogs();

    if (expiredLogs.length === 0) {
      return 0;
    }

    // 2. 일괄 상태 업데이트 (working → done)
    const workLogIds = expiredLogs.map((log) => log.user_work_log_id);
    await WorkLogRepository.updateManyStatus(workLogIds, 'done');

    console.log(`[Scheduler] ${expiredLogs.length}개의 근무 기록이 자동 퇴근 처리되었습니다.`);
    return expiredLogs.length;
  }

  /**
   * 출근 시간이 지났는데 scheduled 상태 → absent(결근)로 일괄 변경
   * 스케줄러에서 호출
   * @returns 결근 처리된 근무 기록 수
   */
  async autoMarkAbsentLogs(): Promise<number> {
    // 1. 출근 시간이 지난 scheduled 상태 조회
    const absentCandidates = await WorkLogRepository.findAbsentCandidateLogs();

    if (absentCandidates.length === 0) {
      return 0;
    }

    // 2. 일괄 상태 업데이트 (scheduled → absent)
    const workLogIds = absentCandidates.map((log) => log.user_work_log_id);
    await WorkLogRepository.updateManyStatus(workLogIds, 'absent');

    console.log(`[Scheduler] ${absentCandidates.length}개의 근무 기록이 결근 처리되었습니다.`);
    return absentCandidates.length;
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
