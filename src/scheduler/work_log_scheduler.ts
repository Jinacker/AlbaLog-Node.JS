import cron from 'node-cron';
import WorkLogService from '../service/work_log_service';

/**
 * Work Log Scheduler
 * - 퇴근 시간이 지난 근무 기록을 자동으로 done 상태로 변경
 * - 출근 시간이 지났는데 출근 안 한 기록을 absent(결근) 상태로 변경
 */

/**
 * 스케줄러 초기화
 * 매 분마다 실행하여:
 * 1. 퇴근 시간이 지난 working 상태 → done
 * 2. 출근 시간이 지난 scheduled 상태 → absent
 */
export function initWorkLogScheduler(): void {
  // 매 분마다 실행 (* * * * *)
  cron.schedule('* * * * *', async () => {
    try {
      // 1. 자동 퇴근 처리 (working → done)
      const checkOutCount = await WorkLogService.autoCheckOutExpiredLogs();
      if (checkOutCount > 0) {
        console.log(`[WorkLogScheduler] ${checkOutCount}개의 근무 기록이 자동 퇴근 처리됨`);
      }

      // 2. 결근 처리 (scheduled → absent)
      const absentCount = await WorkLogService.autoMarkAbsentLogs();
      if (absentCount > 0) {
        console.log(`[WorkLogScheduler] ${absentCount}개의 근무 기록이 결근 처리됨`);
      }
    } catch (error) {
      console.error('[WorkLogScheduler] 스케줄러 실행 중 오류 발생:', error);
    }
  });

  console.log('[WorkLogScheduler] 스케줄러가 시작되었습니다. (매 분마다 실행)');
}
