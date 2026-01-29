import prisma from '../config/prisma';
import { user_work_log_status } from '@prisma/client';

/**
 * Work Log Repository
 * 근무 기록 관련 데이터베이스 접근 계층
 */
class WorkLogRepository {
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
      alba_id: Uint8Array;
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
      };
    }[]
  > {
    // 날짜 범위 설정 (해당 날짜의 00:00:00 ~ 23:59:59)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

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
