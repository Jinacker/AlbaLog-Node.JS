import { StoreReviewRequestDto, StoreReviewResponseDto,StoreReviewDto } from "../DTO/store_review_dto";
import { createStoreReview,findReviewsByStoreId } from "../repository/store_review_repository";
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
    /**
     * 특정 가게의 모든 리뷰를 조회하여 DTO 형태로 반환
     */
    export const getStoreReviewById= async(storeIdStr: string): Promise<StoreReviewDto>=>{
        //UUID 문자열을 DB 조회를 위한 Buffer로 변환
        const storeIdBuffer = Buffer.from(uuidToBuffer(storeIdStr));

        // 레포지토리 호출
        const reviews = await findReviewsByStoreId(storeIdBuffer);

        return {
            reviews: reviews.map(rev => ({
            reviewId: bufferToUuid(rev.review_id),
            userId: bufferToUuid(rev.user_id),
            storeId: bufferToUuid(rev.store_id),
            userName: rev.user.user_name,
            storeName: rev.store.store_name,
            totalScore: rev.total_score,
            kindness: rev.kindness_rating,
            communication: rev.communication_rating,
            settlement: rev.settlement_rating,
            rest: rev.break_time_rating,
            review: rev.review, 
            createdAt: rev.created_at,
            updatedAt: rev.updated_at
            }))
        };
    }