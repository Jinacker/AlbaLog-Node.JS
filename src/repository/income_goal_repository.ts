// src/repository/income_goal_repository.ts
import { CustomError } from '../DTO/error_dto';
import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

class IncomeGoalRepository {
  public async updateIncomeGoal(params: {
    userId: Uint8Array; // Binary(16)
    incomeGoal: number | null;
  }): Promise<{ income_goal: number | null }> {
    const { userId, incomeGoal } = params;
    const userIdBuf = Buffer.from(userId);

    try {
      const updated = await prisma.user.update({
        where: { user_id: userIdBuf },
        data: { income_goal: incomeGoal },
        select: { income_goal: true },
      });

      return updated;
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new CustomError(
          'EC404',
          404,
          '해당 사용자를 찾을 수 없습니다.',
          { userId: userIdBuf }, // 컨텍스트(필요 없으면 null로 둬도 됨)
        );
      }

      throw err; // 나머지는 그대로 올림(미들웨어가 500 처리)
    }
  }
}

export const incomeGoalRepository = new IncomeGoalRepository();
