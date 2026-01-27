// income_dashboard_controller.ts
import { Controller, Get, Query, Route, Security, Tags, Request } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { IncomeDashboardService } from '../service/income_dashboard_service';

@Route('income')
@Tags('Income')
export class IncomeDashboardController extends Controller {
  private service = new IncomeDashboardService();

  @Get('dashboard')
  @Security('jwt')
  public async getDashboard(
    @Request() req: ExpressRequest,
    @Query() month?: string,
    @Query() groupBy: 'store' | 'category' = 'store',
  ) {
    // auth 미들웨어에서 req.user에 user_id(Buffer or uuid string) 넣는 방식에 맞춰 수정
    const userId = (req as any).user?.id as Buffer;

    const data = await this.service.getDashboard(userId, month ?? '', groupBy);
    return { resultType: 'SUCCESS', data };
  }
}
