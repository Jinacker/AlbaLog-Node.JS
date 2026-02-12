import { Tags, Route,SuccessResponse,Response, Get, Path, Controller, Post, Body, Security,Request} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { AlbaApplyRequestDto, AlbaApplyResponseDto, AlbaDetailResponseDto } from '../DTO/alba_application_dto';
import { getAlbaDetail,postAlbaApplication } from '../service/alba_application_service';
import { uuidToBuffer } from '../util/uuid_util';

@Route('api/alba/application')
@Tags('Alba Application')
export class AlbaApplicationController extends Controller{
    /**
     * 대타 아르바이트 정보 상세 조회 API
     * @params albaId
     */
    @Get('{albaId}')
    @SuccessResponse('200','조회 성공')
    @Response('404','Not Found')
    @Response('500','Internal Server Error')
    

    public async fetchAlbaDetail(
        @Path() albaId:string
    ):Promise<AlbaDetailResponseDto>{
        //알바 상세 정보 조회
        const result = await getAlbaDetail(albaId);
        return result
    }

    /**
     * 대타 아르바이트 지원 
     * @param requestBody (albaId,userId)
     * @returns 지원 정보와 정산 상태, 승인 여부(초기에는 전부 waiting으로 설정)
     */
    @Post('')
    @Security('jwt')
    @SuccessResponse('201','생성 성공')
    @Response('401','Unauthorized')
    @Response('404','Not Found')
    @Response('500','Internal Server Error')
    
    public async applyAlba(
        @Request() req:ExpressRequest,
        @Body() requestBody:AlbaApplyRequestDto
    ):Promise<AlbaApplyResponseDto>{
        //UUID 문자열 Buffer로 변환
        const userId = (req.user as unknown as { id: string }).id;
        const userBuffer=Buffer.from(uuidToBuffer(userId))

        const albaBuffer=Buffer.from(uuidToBuffer(requestBody.albaId))


        //대타 아르바이트 지원
        const result = await postAlbaApplication(userBuffer,albaBuffer)
        this.setStatus(201)
        return result

    }
}