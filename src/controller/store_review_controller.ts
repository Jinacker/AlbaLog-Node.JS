import { Tags, Route,SuccessResponse,Response,Request,Path, Post, Body, Controller, Security, Get} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import {StoreReviewDto, StoreReviewRequestDto,StoreReviewResponseDto} from '../DTO/store_review_dto'
import { addReview,getStoreReviewById } from '../service/store_review_service';
import { uuidToBuffer } from '../util/uuid_util';

/**
 * 사용자가 평가하는 가게 리뷰 API
 */
@Route('api/store/review')
@Tags('Store Review')
export class StoreReviewController extends Controller{
    /** 
     * 근무지 평가 API
     * @param requestBody에 리뷰 데이터 포함(userId,storeId,평가지수)
     * @returns 생성된 리뷰 정보 + 가게,유저명 반환
     */
    @Post()
    @Security('jwt')
    @SuccessResponse('201','Created')
    @Response('400','Bad Request')
    @Response('500','Internal Server Error')

    public async createStoreReview(
        @Request() req: ExpressRequest,
        @Body() requestBody:StoreReviewRequestDto
    ): Promise<StoreReviewResponseDto>{
        const userId = (req.user as unknown as { id: string }).id;
        const userBuffer=Buffer.from(uuidToBuffer(userId))
        
        const result = await addReview(userBuffer,requestBody);
        this.setStatus(201);
        return result;
    }

    /** 
     * 근무지 평가 조회 API
     * @param 쿼리 파라미터로 가게 Id
     * @returns 리뷰 정보 + 가게,유저명 반환
     */
    @Get('/{storeId}')
    @Security('jwt')
    @SuccessResponse('200','조회 성공')
    @Response('400','Bad Request')
    @Response('500','Internal Server Error')
    public async getStoreReview(
        @Path() storeId: string,
    ): Promise<StoreReviewDto>{

        const result= await getStoreReviewById(storeId)
        this.setStatus(201);
        return result;
    }
}