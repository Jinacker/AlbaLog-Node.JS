import {Get, Tags, Route, Query,SuccessResponse,Response, Request, Security} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { fetchAlbaStatus } from '../service/alba_status_service';
import { AlbaStatusDTO } from '../DTO/alba_status_dto';
import { TsoaSuccessResponse } from '../config/response_interface';
import { uuidToBuffer } from '../util/uuid_util';
@Route('api/alba')
@Tags('Alba Status')
export class AlbaController{
    /** 
     * 아르바이트지원 현황 조회 API
     * @param type 전체(all), 진행중(active), 모집완료(closed)
     * @returns 지원 현황 리스트 응답
     */
    @Get('/status')
    @Security('jwt')
    @SuccessResponse('200','리스트 조회 성공')
    @Response('401','Unauthorized')
    @Response('500','Internal Server Error')

    public async getAlbaStatus(
        @Request() req:ExpressRequest,
        @Query() type: 'all'|'active'|'closed'='all'
    ): Promise<TsoaSuccessResponse<AlbaStatusDTO[]>>
    {
        //UUID 문자열 Buffer로 변환
        const userId = (req.user as unknown as { id: string }).id;
        const userBuffer=Buffer.from(uuidToBuffer(userId))

        const result=await fetchAlbaStatus(userBuffer,type);
        return new TsoaSuccessResponse(result);
    }
}