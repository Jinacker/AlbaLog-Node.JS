import {Get,Route,SuccessResponse,Response, Tags, Controller, Queries} from 'tsoa'
import { SearchAlbaRequestDto,SearchAlbaResponseDto } from '../DTO/search_alba_dto';
import { getFilteredAlba } from '../service/search_alba_service';


/**
 * Search Alba Controller
 * 조건에 맞는 대타 아르바이트 검색 API
 */
@Route('api/alba')
@Tags('Alba Search')

export class SearchAlbaController extends Controller{
    /**
     * 필터에 맞는 아르바이트 조회
     * @param params(날짜,가게이름,가게카테고리,총근무시간,시급) 
     * @returns 조건에 맞는 알바 리스트
     */
    @Get('search')
    @SuccessResponse('200','조회 성공')
    @Response('400','Bad Request')
    @Response('500','Internal Error')
    public async searchFilteredAlba(
        @Queries() params:SearchAlbaRequestDto
    ): Promise<SearchAlbaResponseDto[]>{
        const result = await getFilteredAlba(params)

        return result
    }
}