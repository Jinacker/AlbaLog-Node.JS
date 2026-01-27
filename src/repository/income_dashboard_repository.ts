// income_dashboard_repository.ts
import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

const workLogWithPostingArgs = Prisma.validator<Prisma.user_work_logFindManyArgs>()({
  include: {
    alba_posting: {
      include: {
        store: { include: { store_category: true } },
      },
    },
  },
});

type WorkLogWithPosting = Prisma.user_work_logGetPayload<typeof workLogWithPostingArgs>;

export class IncomeDashboardRepository {
  // ✅ CHANGED: Buffer -> Uint8Array 로 받기
  async findWorkLogsForMonth(
    userId: Uint8Array,
    start: Date,
    end: Date,
  ): Promise<WorkLogWithPosting[]> {
    // ✅ CHANGED: Prisma에는 Buffer로 넣기
    const userIdBuf = Buffer.from(userId);

    return prisma.user_work_log.findMany({
      where: {
        user_id: userIdBuf, // ✅ CHANGED
        work_date: { gte: start, lt: end },
      },
      include: {
        alba_posting: {
          include: {
            store: { include: { store_category: true } },
          },
        },
      },
    });
  }

  // ✅ CHANGED: Buffer -> Uint8Array 로 받기
  async findUserAlbaSettlementStatuses(userId: Uint8Array) {
    const userIdBuf = Buffer.from(userId); // ✅ CHANGED

    return prisma.user_alba.findMany({
      where: { user_id: userIdBuf }, // ✅ CHANGED
      select: { alba_id: true, settlement_status: true },
    });
  }
}

export default new IncomeDashboardRepository();
