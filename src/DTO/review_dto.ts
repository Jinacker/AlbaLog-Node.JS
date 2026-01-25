/**
 * 리뷰 응답 DTO
 */
export interface ReviewResponseDto {
  reviewId: string;
  storeId: string;
  storeName: string;
  totalScore: number;
  kindnessRating: number;
  communicationRating: number;
  settlementRating: number;
  breakTimeRating: number;
  review: string;
  createdAt: string; // ISO 8601 날짜
  updatedAt: string;
}

/**
 * 리뷰 목록 응답 DTO
 */
export interface ReviewListResponseDto {
  reviews: ReviewResponseDto[];
  totalCount: number;
}

/**
 * 리뷰 수정 요청 DTO
 */
export interface UpdateReviewRequestDto {
  totalScore?: number;
  kindnessRating?: number;
  communicationRating?: number;
  settlementRating?: number;
  breakTimeRating?: number;
  review?: string;
}
