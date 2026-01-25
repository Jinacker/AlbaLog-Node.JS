import prisma from '../config/prisma';

/**
 * Review Repository
 * 리뷰 관련 데이터베이스 접근 계층
 */
class ReviewRepository {
  /**
   * 사용자의 리뷰 목록 조회 (시간순 정렬)
   * @param userId - 사용자 ID (Binary(16) UUID)
   * @param orderBy - 정렬 방식 ('desc' = 최신순, 'asc' = 오래된순)
   * @returns 리뷰 목록
   */
  async findReviewsByUserId(userId: Uint8Array, orderBy: 'desc' | 'asc' = 'desc') {
    return await prisma.store_review.findMany({
      where: { user_id: userId as Uint8Array<ArrayBuffer> },
      include: {
        store: true, // 가게 정보 포함
      },
      orderBy: {
        created_at: orderBy,
      },
    });
  }

  /**
   * 리뷰 ID로 리뷰 조회
   * @param reviewId - 리뷰 ID
   * @returns 리뷰 정보
   */
  async findReviewById(reviewId: Uint8Array) {
    return await prisma.store_review.findUnique({
      where: { review_id: reviewId as Uint8Array<ArrayBuffer> },
      include: {
        store: true,
      },
    });
  }

  /**
   * 리뷰 수정
   * @param reviewId - 리뷰 ID
   * @param data - 수정할 데이터
   * @returns 수정된 리뷰
   */
  async updateReview(
    reviewId: Uint8Array,
    data: {
      total_score?: number;
      kindness_rating?: number;
      communication_rating?: number;
      settlement_rating?: number;
      break_time_rating?: number;
      review?: string;
    },
  ) {
    return await prisma.store_review.update({
      where: { review_id: reviewId as Uint8Array<ArrayBuffer> },
      data,
      include: {
        store: true,
      },
    });
  }

  /**
   * 리뷰 삭제
   * @param reviewId - 리뷰 ID
   */
  async deleteReview(reviewId: Uint8Array) {
    return await prisma.store_review.delete({
      where: { review_id: reviewId as Uint8Array<ArrayBuffer> },
    });
  }

  /**
   * 사용자의 리뷰 개수 조회
   * @param userId - 사용자 ID
   * @returns 리뷰 개수
   */
  async countReviewsByUserId(userId: Uint8Array): Promise<number> {
    return await prisma.store_review.count({
      where: { user_id: userId as Uint8Array<ArrayBuffer> },
    });
  }
}

export default new ReviewRepository();
