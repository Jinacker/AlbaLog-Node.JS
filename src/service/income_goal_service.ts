// src/service/income_goal_service.ts

import { UpdateIncomeGoalResponseDTO } from '../DTO/income_goal_dto';
import { incomeGoalRepository } from '../repository/income_goal_repository';
import { uuidToBuffer } from '../util/uuid_util';
import { CustomError } from '../DTO/error_dto';

class IncomeGoalService {
  public async updateMyIncomeGoal(params: {
    userIdUuid: string; // JWT에서 온 UUID 문자열
    incomeGoal: number | null;
  }): Promise<UpdateIncomeGoalResponseDTO> {
    const { userIdUuid, incomeGoal } = params;

    if (incomeGoal !== null) {
      if (typeof incomeGoal !== 'number' || Number.isNaN(incomeGoal)) {
        throw new CustomError('EC400', 400, 'incomeGoal은 숫자여야 합니다.', null);
      }
      if (!Number.isInteger(incomeGoal)) {
        throw new CustomError('EC400', 400, 'incomeGoal은 정수여야 합니다.', null);
      }
      if (incomeGoal < 0) {
        throw new CustomError('EC400', 400, 'incomeGoal은 0 이상이어야 합니다.', null);
      }
    }

    const userIdBin = uuidToBuffer(userIdUuid);

    const updated = await incomeGoalRepository.updateIncomeGoal({
      userId: userIdBin,
      incomeGoal,
    });

    return { incomeGoal: updated.income_goal };
  }
}

export const incomeGoalService = new IncomeGoalService();
