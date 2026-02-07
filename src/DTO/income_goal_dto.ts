// src/DTO/income_goal_dto.ts

export interface UpdateIncomeGoalRequestDTO {
  incomeGoal: number; 
}

export interface UpdateIncomeGoalResponseDTO {
  incomeGoal: number | null;
}
