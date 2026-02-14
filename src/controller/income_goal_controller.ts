// src/controller/income_goal_controller.ts

import {
  Controller,
  Patch,
  Route,
  Tags,
  Security,
  Body,
  Request,
  SuccessResponse,
  Response,
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { TsoaSuccessResponse, TsoaFailResponse } from '../config/response_interface';
import { UpdateIncomeGoalRequestDTO, UpdateIncomeGoalResponseDTO } from '../DTO/income_goal_dto';
import { incomeGoalService } from '../service/income_goal_service';
import { CustomError } from '../DTO/error_dto';

@Route('api/users')
@Tags('Income Goal')
export class IncomeGoalController extends Controller {
  /**
   * 내 수입 목표(income_goal) 수정
   */
  @Patch('income-goal')
  @Security('jwt')
  @SuccessResponse('200', '수입 목표 수정 성공')
  @Response<TsoaFailResponse<any>>(401, 'Unauthorized', {
    resultType: 'FAIL' as any,
    error: { errorCode: 'EC401', errorMessage: '인증이 필요합니다.', data: null },
    success: null,
  })
  @Response<TsoaFailResponse<any>>(500, 'Internal Server Error', {
    resultType: 'FAIL' as any,
    error: {
      errorCode: 'EC500',
      errorMessage: '서버 오류가 발생했습니다.',
      data: null,
    },
    success: null,
  })
  public async updateMyIncomeGoal(
    @Request() req: ExpressRequest,
    @Body() body: UpdateIncomeGoalRequestDTO,
  ): Promise<TsoaSuccessResponse<UpdateIncomeGoalResponseDTO>> {
    const userUuid = (req as any).user?.id as string;

    if (!userUuid) {
      throw new CustomError('EC401', 401, '인증 정보에서 userId를 찾을 수 없습니다.', null);
    }

    const result = await incomeGoalService.updateMyIncomeGoal({
      userIdUuid: userUuid,
      incomeGoal: body.incomeGoal,
    });

    this.setStatus(200);
    return new TsoaSuccessResponse(result);
  }
}
