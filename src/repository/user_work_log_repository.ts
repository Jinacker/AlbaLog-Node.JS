import prisma from '../config/prisma';
import { uuidToBin } from '../util/uuid';

export class UserWorkLogRepository {
  public async findByIdAndUser(user_id: string, user_work_log_id: string) {
    return prisma.user_work_log.findFirst({
      where: {
        user_id: uuidToBin(user_id),
        user_work_log_id: uuidToBin(user_work_log_id),
      },
      select: {
        work_date: true,
        start_time: true,
        end_time: true,
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
