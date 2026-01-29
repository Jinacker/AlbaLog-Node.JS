import { Tags, Route,SuccessResponse,Response, Post, Body, Controller} from 'tsoa';
import {StoreReviewRequestDto,StoreReviewResponseDto} from '../DTO/store_review_dto'
import { addReview } from '../service/store_review_service';

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
    @SuccessResponse('201','Created')
    @Response('400','Bad Request')
    @Response('500','Internal Server Error')

    public async createStoreReview(
        @Body() requestBody:StoreReviewRequestDto
    ): Promise<StoreReviewResponseDto>{
        const result = await addReview(requestBody);
        this.setStatus(201);
        return result;
    }
}