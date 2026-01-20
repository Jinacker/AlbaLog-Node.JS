import {Get, Tags, Route, Query,SuccessResponse,Response, Path} from 'tsoa';
import { fetchAlbaStatus } from '../service/alba_status_service';
import { AlbaStatusDTO } from '../DTO/alba_status_dto';
import { TsoaSuccessResponse } from '../config/response_interface';
@Route('api/alba_status')
@Tags('Alba Status')
export class AlbaController{
    /** 
     * 아르바이트지원 현황 조회 API
     * @param type 전체(all), 진행중(active), 모집완료(closed)
     * @returns 지원 현황 리스트 응답
     */
    @Get('{userId}')
    @SuccessResponse('200','리스트 조회 성공')
    @Response('404','User Not Found')
    @Response('500','Interval Server Error')

    public async getAlbaStatus(
        @Path() userId:string,
        @Query() type: 'all'|'active'|'closed'='all'
    ): Promise<TsoaSuccessResponse<AlbaStatusDTO[]>>
    {
        //UUID 문자열 Buffer로 변환
        const userBuffer=Buffer.from(userId.replace(/-/g,''),'hex')
        const result=await fetchAlbaStatus(userBuffer,type);
        return new TsoaSuccessResponse(result);
    }
}