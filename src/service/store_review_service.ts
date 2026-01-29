import { StoreReviewRequestDto, StoreReviewResponseDto } from "../DTO/store_review_dto";
import { createStoreReview } from "../repository/store_review_repository";

/**
 * 리뷰 생성 서비스 로직
 * @param data(리뷰 데이터)
 * @returns 생성된 리뷰 데이터와 생성시각, 합산된 총점
 */
export const addReview = async(data:StoreReviewRequestDto):Promise<StoreReviewResponseDto>=>{
    const review = await createStoreReview(data);
    return review;
}