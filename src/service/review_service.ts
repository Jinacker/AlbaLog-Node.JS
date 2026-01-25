import ReviewRepository from '../repository/review_repository';
import { ReviewResponseDto, ReviewListResponseDto, UpdateReviewRequestDto } from '../DTO/review_dto';

/**
 * Review Service
 * 리뷰 관련 비즈니스 로직 처리
 */
class ReviewService {
  /**
   * 사용자의 리뷰 목록 조회
   * @param userId - 사용자 ID (Buffer 형식)
   * @param orderBy - 정렬 방식 ('desc' = 최신순, 'asc' = 오래된순)
   * @returns 리뷰 목록
   */
  async getReviewsByUserId(
    userId: Uint8Array,
    orderBy: 'desc' | 'asc' = 'desc',
  ): Promise<ReviewListResponseDto> {
    // 1. 리뷰 목록 조회
    const reviews = await ReviewRepository.findReviewsByUserId(userId, orderBy);

    // 2. 총 개수 조회
    const totalCount = await ReviewRepository.countReviewsByUserId(userId);

    // 3. DTO 형식으로 변환
    const reviewDtos: ReviewResponseDto[] = reviews.map((review) => ({
      reviewId: this.bufferToUuid(review.review_id),
      storeId: this.bufferToUuid(review.store_id),
      storeName: review.store?.store_name || '',
      totalScore: review.total_score || 0,
      kindnessRating: review.kindness_rating || 0,
      communicationRating: review.communication_rating || 0,
      settlementRating: review.settlement_rating || 0,
      breakTimeRating: review.break_time_rating || 0,
      review: review.review || '',
      createdAt: review.created_at?.toISOString() || '',
      updatedAt: review.updated_at?.toISOString() || '',
    }));

    return {
      reviews: reviewDtos,
      totalCount,
    };
  }

  /**
   * 리뷰 수정
   * @param reviewId - 리뷰 ID
   * @param userId - 사용자 ID (본인 확인용)
   * @param data - 수정할 데이터
   * @returns 수정된 리뷰
   */
  async updateReview(
    reviewId: Uint8Array,
    userId: Uint8Array,
    data: UpdateReviewRequestDto,
  ): Promise<ReviewResponseDto> {
    // 1. 리뷰 존재 여부 및 본인 확인
    const existingReview = await ReviewRepository.findReviewById(reviewId);

    if (!existingReview) {
      throw new Error('리뷰를 찾을 수 없습니다.');
    }

    // 본인이 작성한 리뷰인지 확인
    if (Buffer.from(existingReview.user_id).toString('hex') !== Buffer.from(userId).toString('hex')) {
      throw new Error('본인이 작성한 리뷰만 수정할 수 있습니다.');
    }

    // 2. 데이터 변환 (DTO → DB 형식)
    const updateData: any = {};

    if (data.totalScore !== undefined) updateData.total_score = data.totalScore;
    if (data.kindnessRating !== undefined) updateData.kindness_rating = data.kindnessRating;
    if (data.communicationRating !== undefined) updateData.communication_rating = data.communicationRating;
    if (data.settlementRating !== undefined) updateData.settlement_rating = data.settlementRating;
    if (data.breakTimeRating !== undefined) updateData.break_time_rating = data.breakTimeRating;
    if (data.review !== undefined) updateData.review = data.review;

    // 3. 리뷰 수정
    const updatedReview = await ReviewRepository.updateReview(reviewId, updateData);

    // 4. DTO 형식으로 반환
    return {
      reviewId: this.bufferToUuid(updatedReview.review_id),
      storeId: this.bufferToUuid(updatedReview.store_id),
      storeName: updatedReview.store?.store_name || '',
      totalScore: updatedReview.total_score || 0,
      kindnessRating: updatedReview.kindness_rating || 0,
      communicationRating: updatedReview.communication_rating || 0,
      settlementRating: updatedReview.settlement_rating || 0,
      breakTimeRating: updatedReview.break_time_rating || 0,
      review: updatedReview.review || '',
      createdAt: updatedReview.created_at?.toISOString() || '',
      updatedAt: updatedReview.updated_at?.toISOString() || '',
    };
  }

  /**
   * 리뷰 삭제
   * @param reviewId - 리뷰 ID
   * @param userId - 사용자 ID (본인 확인용)
   */
  async deleteReview(reviewId: Uint8Array, userId: Uint8Array): Promise<void> {
    // 1. 리뷰 존재 여부 및 본인 확인
    const existingReview = await ReviewRepository.findReviewById(reviewId);

    if (!existingReview) {
      throw new Error('리뷰를 찾을 수 없습니다.');
    }

    // 본인이 작성한 리뷰인지 확인
    if (Buffer.from(existingReview.user_id).toString('hex') !== Buffer.from(userId).toString('hex')) {
      throw new Error('본인이 작성한 리뷰만 삭제할 수 있습니다.');
    }

    // 2. 리뷰 삭제
    await ReviewRepository.deleteReview(reviewId);
  }

  /**
   * Buffer(Binary UUID)를 문자열 UUID로 변환
   * @param buffer - Uint8Array 형식의 UUID
   * @returns 문자열 UUID
   */
  private bufferToUuid(buffer: Uint8Array): string {
    const hex = Buffer.from(buffer).toString('hex');
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
  }
}

export default new ReviewService();
