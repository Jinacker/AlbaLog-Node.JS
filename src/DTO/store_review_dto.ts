export interface StoreReviewRequestDto{
    storeId:string,
    kindness:number,
    communication:number,
    settlement:number,
    rest:number,
    review:string,
}

export interface StoreReviewResponseDto{
    reviewId:string,
    userId:string,
    storeId:string,
    userName:string,
    storeName:string,
    totalScore:number,
    kindness:number,
    communication:number,
    settlement:number,
    rest:number,
    review:string,
    createdAt:Date,
    updatedAt:Date
}
