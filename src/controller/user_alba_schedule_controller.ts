import {
  Controller,
  Route,
  Post,
  Tags,
  Patch,
  Delete,
  SuccessResponse,
  Body,
  Request,
  Response,
  Security,
  Path,
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { TsoaSuccessResponse, TsoaFailResponse } from '../config/response_interface';
import {
  CreateManualScheduleBody,
  CreateFromAlbaBody,
  UpdateManualScheduleBody,
} from '../DTO/user_alba_schedule_dto';
import * as userAlbaScheduleService from '../service/user_alba_schedule_service';
export interface CreateScheduleSuccess {
  user_alba_schedule_id: string;
}

// export interface UpdateScheduleSuccess {
//   resultType: 'SUCCESS';
//   SuccessMessage: '유저 알바 스케줄 수정 성공';
//   user_alba_schedule_id: string;
// }

// export interface DeleteScheduleSuccess {

//   user_alba_schedule_id: string;
// }

@Route('user/alba/schedule')
@Tags('User Alba Schedule')
export class UserAlbaScheduleController extends Controller {
  /*
   * 유저 알바 스케줄 등록 API
   * @param request - Express 요청 객체

   * @param body - 스케줄 정보
   * @returns 요청 성공 여부
*/
  /////////// 유저 수동 입력 //////
  @Security('jwt')
  @Post('manual') // 유저 수동 입력
  @SuccessResponse(201, '유저 알바 스케줄 등록 성공(수동 입력)')
  @Response<TsoaFailResponse<null>>(401, 'Unauthorized', {
    resultType: 'FAIL' as any,
    error: { errorCode: 'UNAUTHORIZED', errorMessage: '인증이 필요합니다.' },
    success: null,
  })
  @Response<TsoaFailResponse<any>>(400, 'Bad Request', {
    resultType: 'FAIL' as any,
    error: {
      errorCode: 'EC400',
      errorMessage: '알바 스케줄 정보가 부적절합니다.',
      data: null,
    },
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
  public async createManual(
    @Request() req: ExpressRequest,
    @Body() body: CreateManualScheduleBody,
  ): Promise<TsoaSuccessResponse<CreateScheduleSuccess>> {
    const userUuid = (req as any).user?.id as string;
    const id = await userAlbaScheduleService.createManual(userUuid, body);
    void body;

    this.setStatus(201);
  return new TsoaSuccessResponse({
    user_alba_schedule_id: id,
  });
  }

  ////// // 유저 알바 정보 기반 //////
  @Security('jwt')
  @Post('from-alba') // 유저 알바 정보 기반
  @SuccessResponse(201, '유저 알바 스케줄 등록 성공(알바 정보 기반)')
  @Response<TsoaFailResponse<null>>(401, 'Unauthorized', {
    resultType: 'FAIL' as any,
    error: { errorCode: 'UNAUTHORIZED', errorMessage: '인증이 필요합니다.' },
    success: null,
  })
  @Response<TsoaFailResponse<any>>(400, 'Bad Request', {
    resultType: 'FAIL' as any,
    error: {
      errorCode: 'EC400',
      errorMessage: '알바 스케줄 정보가 부적절합니다.',
      data: null,
    },
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
  public async createFromAlba(
    @Request() req: ExpressRequest,
    @Body() body: CreateFromAlbaBody,
  ): Promise<TsoaSuccessResponse<CreateScheduleSuccess>> {
    const userUuid = (req as any).user?.id as string;
    const id = await userAlbaScheduleService.createFromAlba(userUuid, body);

    this.setStatus(201);
    return new TsoaSuccessResponse<CreateScheduleSuccess>({
      user_alba_schedule_id: id,
    });
  }
  /**
   * 유저 알바 스케줄 수정 API
   */
  @Security('jwt')
  @Patch('{userAlbaScheduleId}')
  @SuccessResponse(200, '유저 알바 스케줄 수정 성공')
  @Response<TsoaFailResponse<any>>(400, 'Bad Request', {
    resultType: 'FAIL' as any,
    error: { errorCode: 'EC400', errorMessage: '수정 요청이 부적절합니다.', data: null },
    success: null,
  })
  @Response<TsoaFailResponse<any>>(401, 'Unauthorized', {
    resultType: 'FAIL' as any,
    error: { errorCode: 'EC401', errorMessage: '인증이 필요합니다.', data: null },
    success: null,
  })
  @Response<TsoaFailResponse<any>>(404, 'Not Found', {
    resultType: 'FAIL' as any,
    error: { errorCode: 'EC404', errorMessage: '스케줄을 찾을 수 없습니다.', data: null },
    success: null,
  })
  @Response<TsoaFailResponse<any>>(500, 'Internal Server Error', {
    resultType: 'FAIL' as any,
    error: { errorCode: 'EC500', errorMessage: '서버 오류가 발생했습니다.', data: null },
    success: null,
  })
  public async updateSchedule(
    @Request() req: ExpressRequest,
    @Path() userAlbaScheduleId: string,
    @Body() body: UpdateManualScheduleBody,
  ): Promise<TsoaSuccessResponse<any>> {
    const userUuid = (req as any).user?.id as string;
    await userAlbaScheduleService.update(userUuid, userAlbaScheduleId, body);

    this.setStatus(200);
    return new TsoaSuccessResponse({
      user_alba_schedule_id: userAlbaScheduleId,
    });
  }

  /**
   * 내 유저 알바 스케줄 삭제 API (수동, 알바정보 기반 공통)
   */
  @Security('jwt')
  @Delete('{userAlbaScheduleId}')
  @SuccessResponse(200, '유저 알바 스케줄 삭제 성공')
  @Response<TsoaFailResponse<any>>(401, 'Unauthorized', {
    resultType: 'FAIL' as any,
    error: { errorCode: 'EC401', errorMessage: '인증이 필요합니다.', data: null },
    success: null,
  })
  @Response<TsoaFailResponse<any>>(404, 'Not Found', {
    resultType: 'FAIL' as any,
    error: { errorCode: 'EC404', errorMessage: '스케줄을 찾을 수 없습니다.', data: null },
    success: null,
  })
  @Response<TsoaFailResponse<any>>(500, 'Internal Server Error', {
    resultType: 'FAIL' as any,
    error: { errorCode: 'EC500', errorMessage: '서버 오류가 발생했습니다.', data: null },
    success: null,
  })
  public async deleteSchedule(
    @Request() req: ExpressRequest,
    @Path() userAlbaScheduleId: string,
  ): Promise<TsoaSuccessResponse<any>> {
    const userUuid = (req as any).user?.id as string;

    await userAlbaScheduleService.remove(userUuid, userAlbaScheduleId);

    this.setStatus(200);
    return new TsoaSuccessResponse({
      user_alba_schedule_id: userAlbaScheduleId,
    });
  }
}
