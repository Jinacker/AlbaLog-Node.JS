import { Body, Controller, Delete, Post, Query, Request, Route, Security, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { DefaultNotificationInterface, ResponseFromNotification } from '../DTO/notification_dto';
import { NotificationService } from '../service/notification_service';
import { TsoaSuccessResponse } from '../config/response_interface';

@Route('api/notification')
@Tags('Notification')
export class NotificationController extends Controller {
  /**
   * 알람 생성 api
   * 알람 type - work_time, work_approve, payment
   * @param body 알람 정보 입력
   * @summary 알람 생성 API
   */
  @Post('/new')
  public async sendNotification(@Body() body: DefaultNotificationInterface) {
    const { userId, message, type } = body;

    const notification = await NotificationService.sendNotificationService({
      userId,
      message,
      type,
    });

    return new TsoaSuccessResponse<ResponseFromNotification>(notification);
  }

  /**
   * 유저 알림 목록 조회
   * @param req
   * @summary 유저 알림 목록 조회 API
   */
  @Post('/get')
  @Security('jwt')
  public async getUserNotification(@Request() req: ExpressRequest) {
    const userId = (req.user as unknown as { id: string }).id;

    const result = await NotificationService.getNotificationService(userId);

    return new TsoaSuccessResponse<ResponseFromNotification[]>(result);
  }

  /**
   * 알림 삭제 API
   * query - 알림 UUID
   * @param req
   * @param notification_id 삭제할 ID
   * @summary 알림 삭제 API (하나)

   */
  @Delete('/delete')
  @Security('jwt')
  public async deleteNotification(
    @Request() req: ExpressRequest,
    @Query() notification_id: string,
  ): Promise<TsoaSuccessResponse<string>> {
    const userId = (req.user as unknown as { id: string }).id;

    const result = await NotificationService.deleteNotificationService(userId, notification_id);

    return new TsoaSuccessResponse<string>(result as string);
  }

  /**
   * 모든 알림 삭제 API
   * @summary 모든 알림 삭제 API
   * @param req
   */
  @Delete('/deleteAll')
  @Security('jwt')
  public async deleteAllNotification(
    @Request() req: ExpressRequest,
  ): Promise<TsoaSuccessResponse<number>> {
    const userId = (req.user as unknown as { id: string }).id;

    const result: number = await NotificationService.deleteAllNotificationService(userId);

    return new TsoaSuccessResponse<number>(result);
  }
}
