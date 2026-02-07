// src/repository/income_goal_repository.ts

import prisma from '../config/prisma';

class IncomeGoalRepository {
  public async updateIncomeGoal(params: {
    userId: Uint8Array; // Binary(16)
    incomeGoal: number | null;
  }): Promise<{ income_goal: number | null }> {
    const { userId, incomeGoal } = params;
    const userIdBuf = Buffer.from(userId);

    const updated = await prisma.user.update({
      where: { user_id: userIdBuf },
      data: { income_goal: incomeGoal },
      select: { income_goal: true },
    });

    return updated;
  }
}

export const incomeGoalRepository = new IncomeGoalRepository();
