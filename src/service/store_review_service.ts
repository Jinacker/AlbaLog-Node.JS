import { StoreReviewRequestDto, StoreReviewResponseDto } from "../DTO/store_review_dto";
import { createStoreReview } from "../repository/store_review_repository";
import { bufferToUuid, uuidToBuffer } from "../util/uuid_util";

/**
 * 리뷰 생성 서비스 로직
 * @param data(리뷰 데이터)
 * @returns 생성된 리뷰 데이터와 생성시각, 합산된 총점
 */
export const addReview = async(userBuffer:Buffer,data:StoreReviewRequestDto):Promise<StoreReviewResponseDto>=>{
    const storeBuffer = Buffer.from(uuidToBuffer(data.storeId))
    
    const review = await createStoreReview(userBuffer,storeBuffer,data);
    const {reviewId, userBuffer: uBuf, storeBuffer: sBuf, ...rest} = review
    return {
        ...rest,
        reviewId:bufferToUuid(reviewId),
        storeId:bufferToUuid(sBuf),
        userId:bufferToUuid(uBuf)
    };
}