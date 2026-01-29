import { Controller, Route, Post, Tags, SuccessResponse, Body, Response } from 'tsoa';
import { TsoaSuccessResponse, TsoaFailResponse } from '../config/response_interface';
import { CreateManualScheduleBody, CreateFromAlbaBody } from '../DTO/user_alba_schedule_dto';
import * as userAlbaScheduleService from '../service/user_alba_schedule_service';
export interface CreateScheduleSuccess {
  user_alba_schedule_id: string;
}

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
  @Post('manual') // 유저 수동 입력
  @SuccessResponse(201, '유저 알바 스케줄 등록 성공(수동 입력)')
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
    @Body() body: CreateManualScheduleBody,
  ): Promise<TsoaSuccessResponse<CreateScheduleSuccess>> {
    const id = await userAlbaScheduleService.createManual(body);
    void body;

    this.setStatus(201);
    return new TsoaSuccessResponse<CreateScheduleSuccess>({
      user_alba_schedule_id: id,
    });
  }

  ////// // 유저 알바 정보 기반 //////
  @Post('from-alba') // 유저 알바 정보 기반
  @SuccessResponse(201, '유저 알바 스케줄 등록 성공(알바 정보 기반)')
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
    @Body() body: CreateFromAlbaBody,
  ): Promise<TsoaSuccessResponse<CreateScheduleSuccess>> {
    const id = await userAlbaScheduleService.createFromAlba(body);

    void body;

    this.setStatus(201);
    return new TsoaSuccessResponse<CreateScheduleSuccess>({
      user_alba_schedule_id: id,
    });
  }
}
