// income_dashboard_repository.ts
import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

type WorkLogWithPosting = Prisma.user_work_logGetPayload<{
  include: {
    alba_posting: {
      include: {
        store: {
          include: { store_category: true };
        };
      };
    };
  };
}>;

export class IncomeDashboardRepository {
  async findWorkLogsForMonth(
    userId: Uint8Array,
    start: Date,
    end: Date,
  ): Promise<WorkLogWithPosting[]> {
    const userIdBuf = Buffer.from(userId);

    return prisma.user_work_log.findMany({
      where: {
        user_id: userIdBuf,
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

  async findUserAlbaSettlementStatuses(userId: Uint8Array) {
    const userIdBuf = Buffer.from(userId);

    return prisma.user_alba.findMany({
      where: { user_id: userIdBuf },
      select: { alba_id: true, settlement_status: true },
    });
  }

  async findUserIncomeGoal(userId: Uint8Array) {
    const userIdBuf = Buffer.from(userId);
    return prisma.user.findUnique({
      where: { user_id: userIdBuf },
      select: { income_goal: true },
    });
  }
}

export default new IncomeDashboardRepository();
