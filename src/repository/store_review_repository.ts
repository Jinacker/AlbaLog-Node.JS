import prisma from '../config/prisma'
import { StoreReviewRequestDto } from "../DTO/store_review_dto";

/**
 * 데이터 가공 및 리뷰 생성
 * @param data
 * @returns 리뷰 상세 정보 및 연관 데이터
 */
export const createStoreReview = async (userBuffer:Buffer,storeBuffer:Buffer,data:StoreReviewRequestDto) =>{
    const {communication,settlement,rest,kindness,review} =data;
    
    //4가지 평가지표의 평균. 표현은 소수점 첫째자리까지
    const totalScore = Number(((communication+kindness+settlement+rest)/4).toFixed(1));
    
    const result = await prisma.store_review.create({
        data:{
            user_id:new Uint8Array(userBuffer),
            store_id:new Uint8Array(storeBuffer),
            kindness_rating:kindness,
            settlement_rating:settlement,
            communication_rating:communication,
            break_time_rating:rest,
            total_score:totalScore,
            review:review
        },
        //store, user 이름이 필요할 것 같아 join처리
        include:{
            user:true,
            store:true
        }
    });

    return {
    reviewId:result.review_id,
    userBuffer,
    storeBuffer,
    userName:result.user.user_name,
    storeName:result.store.store_name,
    totalScore,
    kindness,
    communication,
    settlement,
    rest,
    review,
    createdAt: result.created_at, //생성, 수정 시간 추가
    updatedAt: result.updated_at 
}
}