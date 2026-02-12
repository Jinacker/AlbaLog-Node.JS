import prisma from '../config/prisma';
import { user_work_log_status } from '@prisma/client';

/**
 * Work Log Repository
 * 근무 기록 관련 데이터베이스 접근 계층
 */
class WorkLogRepository {
  /**
   * work_log ID로 단일 조회
   * @param workLogId - 근무 기록 ID (Buffer)
   * @returns 근무 기록
   */
  async findById(workLogId: Uint8Array) {
    return await prisma.user_work_log.findUnique({
      where: { user_work_log_id: workLogId as Uint8Array<ArrayBuffer> },
      include: {
        alba_posting: {
          select: {
            hourly_rate: true,
            store: {
              select: {
                store_name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * 근무 상태 업데이트
   * @param workLogId - 근무 기록 ID (Buffer)
   * @param status - 변경할 상태
   * @returns 업데이트된 근무 기록
   */
  async updateStatus(workLogId: Uint8Array, status: user_work_log_status) {
    return await prisma.user_work_log.update({
      where: { user_work_log_id: workLogId as Uint8Array<ArrayBuffer> },
      data: { status },
    });
  }

  /**
   * 퇴근 시간이 지난 working 상태의 근무 기록 조회
   * @returns 퇴근 시간이 지난 working 상태의 근무 기록 목록
   */
  async findExpiredWorkingLogs() {
    const now = new Date();
    return await prisma.user_work_log.findMany({
      where: {
        status: 'working',
        end_time: {
          lte: now,
        },
      },
    });
  }

  /**
   * 여러 근무 기록의 상태를 일괄 업데이트
   * @param workLogIds - 근무 기록 ID 배열
   * @param status - 변경할 상태
   */
  async updateManyStatus(workLogIds: Uint8Array[], status: user_work_log_status) {
    return await prisma.user_work_log.updateMany({
      where: {
        user_work_log_id: {
          in: workLogIds as Uint8Array<ArrayBuffer>[],
        },
      },
      data: { status },
    });
  }

  /**
   * 출근 시간이 지난 scheduled 상태의 근무 기록 조회 (결근 처리 대상)
   * @returns 출근 시간이 지난 scheduled 상태의 근무 기록 목록
   */
  async findAbsentCandidateLogs() {
    const now = new Date();
    return await prisma.user_work_log.findMany({
      where: {
        status: 'scheduled',
        start_time: {
          lte: now,
        },
      },
    });
  }
  /**
   * 특정 날짜의 사용자 근무 기록 조회 (user_work_log 기반)
   * @param userId - 사용자 ID (Binary(16) UUID)
   * @param date - 조회할 날짜
   * @returns 근무 기록 목록 (alba_posting, store 정보 포함)
   */
  async findWorkLogsByDate(
    userId: Uint8Array,
    date: Date,
  ): Promise<
    {
      user_work_log_id: Uint8Array;
      user_id: Uint8Array;
      alba_id: Uint8Array | null;
      user_alba_schedule_id: Uint8Array | null;
      work_date: Date | null;
      start_time: Date | null;
      end_time: Date | null;
      work_minutes: number | null;
      status: user_work_log_status | null;
      alba_posting: {
        hourly_rate: number | null;
        store: {
          store_name: string | null;
        };
      } | null;
    }[]
  > {
    // KST 기준 오늘 날짜를 YYYY-MM-DD로 구한 뒤 UTC midnight 범위로 설정
    const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const dateStr = kstDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const startOfDay = new Date(dateStr + 'T00:00:00Z');
    const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

    return await prisma.user_work_log.findMany({
      where: {
        user_id: userId as Uint8Array<ArrayBuffer>,
        work_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        alba_posting: {
          select: {
            hourly_rate: true,
            store: {
              select: {
                store_name: true,
              },
            },
          },
        },
      },
    });
  }
}

export default new WorkLogRepository();
