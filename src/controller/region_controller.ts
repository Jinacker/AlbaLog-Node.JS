import { Controller, Get, Query, Route, Tags } from 'tsoa';
import { RegionService } from '../service/region_service';
import { TsoaSuccessResponse } from '../config/response_interface';
import { RegionInterface } from '../DTO/region_dto';

@Route('api/region')
@Tags('Region')
export class RegionController extends Controller {
  private regionService = new RegionService();

  /**
   * 지역 실시간 검색 API
   * @param query 검색어 (예: "인천 미추홀")
   * @summary 지역 코드 실시간 검색 API
   * @returns 지역 코드 검색 결과
   */
  @Get('search')
  public async search(@Query() query: string): Promise<TsoaSuccessResponse<RegionInterface[]>> {
    const result = await this.regionService.searchRegion(query);

    return new TsoaSuccessResponse(result);
  }
}
