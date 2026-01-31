import { Controller, Get, Route, Tags, Query, SuccessResponse, Response, Security } from 'tsoa';
import PlaceService from '../service/place_service';
import { SearchPlaceResponseDto } from '../DTO/place_dto';
import { TsoaSuccessResponse } from '../config/response_interface';

/**
 * Place Controller
 * 카카오 로컬 API를 활용한 장소 검색 API
 *
 * 키워드로 장소를 검색하면 장소명, 주소, 좌표, 카카오맵 URL 등을 반환합니다.
 */
@Route('api/places')
@Tags('Place')
export class PlaceController extends Controller {
  /**
   * 키워드로 장소 검색
   *
   * 장소명을 입력하면 해당 장소 정보를 반환합니다.
   *
   * @param query - 검색할 장소명 (예: "메가MGC커피 상수역점")
   * @returns 장소 검색 결과 목록
   */
  @Get('search')
  @Security('jwt')
  @SuccessResponse('200', '장소 검색 성공')
  @Response(400, 'Bad Request - 검색어가 필요합니다')
  @Response(401, 'Unauthorized')
  @Response(500, 'Internal Server Error')
  public async searchPlace(
    @Query() query: string,
  ): Promise<TsoaSuccessResponse<SearchPlaceResponseDto>> {
    // 1. 검색어 유효성 검사
    if (!query || query.trim() === '') {
      this.setStatus(400);
      throw new Error('검색어를 입력해주세요.');
    }

    // 2. 장소 검색 서비스 호출
    const result = await PlaceService.searchPlace({
      query: query.trim(),
    });

    // 3. 성공 응답 반환
    return new TsoaSuccessResponse(result);
  }
}
