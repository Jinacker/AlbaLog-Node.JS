import { Tags, Route,SuccessResponse,Response, Get, Path, Controller, Post, Body} from 'tsoa';
import { AlbaApplyRequestDto, AlbaApplyResponseDto, AlbaDetailResponseDto } from '../DTO/alba_application_dto';
import { getAlbaDetail,postAlbaApplication } from '../service/alba_application_service';

@Route('api/alba/application')
@Tags('Alba Application')
export class AlbaApplicationController extends Controller{
    /**
     * 대타 아르바이트 정보 상세 조회 API
     * @params albaId
     */
    @SuccessResponse('200','조회 성공')
    @Response('404','Not Found')
    @Response('500','Internal Server Error')
    @Get('{albaId}')

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
    @SuccessResponse('201','생성 성공')
    @Response('404','Not Found')
    @Response('500','Internal Server Error')
    @Post('')
    public async applyAlba(
        @Body() requestBody:AlbaApplyRequestDto
    ):Promise<AlbaApplyResponseDto>{
        //대타 아르바이트 지원
        const result = await postAlbaApplication(requestBody)
        this.setStatus(201)
        return result

    }
}