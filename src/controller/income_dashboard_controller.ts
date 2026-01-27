import {
  Controller,
  Get,
  Query,
  Route,
  Security,
  Tags,
  Request,
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import IncomeDashboardService from '../service/income_dashboard_service';
import { uuidToBin } from '../util/uuid'; // ✅ 네가 준 유틸 사용

@Route('income')
@Tags('Income')
export class IncomeDashboardController extends Controller {
  @Get('dashboard')
  @Security('jwt')
  public async getDashboard(
    @Request() req: ExpressRequest,
    @Query() month?: string,
    @Query() groupBy: 'store' | 'category' = 'store',
  ) {
    const userUuid = (req as any).user?.id as string;
    //const userId = uuidToBin(userUuid);

    return {
      resultType: 'SUCCESS',
      data: await IncomeDashboardService.getDashboard(
        userUuid,
        month ?? '',
        groupBy,
      ),
    };
  }
}
