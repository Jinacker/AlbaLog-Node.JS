import { Controller, Get, Put, Delete, Route, Tags, Path, Body, Query, SuccessResponse, Response } from 'tsoa';
import ReviewService from '../service/review_service';
import { ReviewResponseDto, ReviewListResponseDto, UpdateReviewRequestDto } from '../DTO/review_dto';
import { TsoaSuccessResponse } from '../config/response_interface';

/**
 * Review Controller
 * 내 리뷰 모아보기 API
 */
@Route('api/users')
@Tags('Review')
export class ReviewController extends Controller {
  /**
   * 내 리뷰 목록 조회
   * @param userId - 사용자 ID (UUID 문자열)
   * @param sort - 정렬 방식 ('latest' = 최신순, 'oldest' = 오래된순)
   * @returns 리뷰 목록
   */
  @Get('{userId}/reviews')
  @SuccessResponse('200', '리뷰 목록 조회 성공')
  @Response(404, 'User Not Found')
  @Response(500, 'Internal Server Error')
  public async getMyReviews(
    @Path() userId: string,
    @Query() sort: 'latest' | 'oldest' = 'latest',
  ): Promise<TsoaSuccessResponse<ReviewListResponseDto>> {
    const userIdBuffer = this.uuidToBuffer(userId);
    const orderBy = sort === 'latest' ? 'desc' : 'asc';

    const reviews = await ReviewService.getReviewsByUserId(userIdBuffer, orderBy);

    return new TsoaSuccessResponse(reviews);
  }

  /**
   * 리뷰 수정
   * @param userId - 사용자 ID (UUID 문자열)
   * @param reviewId - 리뷰 ID (UUID 문자열)
   * @param requestBody - 수정할 리뷰 데이터
   * @returns 수정된 리뷰 정보
   */
  @Put('{userId}/reviews/{reviewId}')
  @SuccessResponse('200', '리뷰 수정 성공')
  @Response(400, 'Bad Request')
  @Response(403, 'Forbidden - 본인의 리뷰만 수정 가능')
  @Response(404, 'Review Not Found')
  @Response(500, 'Internal Server Error')
  public async updateReview(
    @Path() userId: string,
    @Path() reviewId: string,
    @Body() requestBody: UpdateReviewRequestDto,
  ): Promise<TsoaSuccessResponse<ReviewResponseDto>> {
    const userIdBuffer = this.uuidToBuffer(userId);
    const reviewIdBuffer = this.uuidToBuffer(reviewId);

    const review = await ReviewService.updateReview(reviewIdBuffer, userIdBuffer, requestBody);

    return new TsoaSuccessResponse(review);
  }

  /**
   * 리뷰 삭제
   * @param userId - 사용자 ID (UUID 문자열)
   * @param reviewId - 리뷰 ID (UUID 문자열)
   */
  @Delete('{userId}/reviews/{reviewId}')
  @SuccessResponse('200', '리뷰 삭제 성공')
  @Response(403, 'Forbidden - 본인의 리뷰만 삭제 가능')
  @Response(404, 'Review Not Found')
  @Response(500, 'Internal Server Error')
  public async deleteReview(
    @Path() userId: string,
    @Path() reviewId: string,
  ): Promise<TsoaSuccessResponse<{ message: string }>> {
    const userIdBuffer = this.uuidToBuffer(userId);
    const reviewIdBuffer = this.uuidToBuffer(reviewId);

    await ReviewService.deleteReview(reviewIdBuffer, userIdBuffer);

    return new TsoaSuccessResponse({ message: '리뷰가 삭제되었습니다.' });
  }

  /**
   * UUID 문자열을 Uint8Array로 변환
   * @param uuid - UUID 문자열 (예: "550e8400-e29b-41d4-a716-446655440000")
   * @returns Uint8Array
   */
  private uuidToBuffer(uuid: string): Uint8Array {
    const hex = uuid.replace(/-/g, '');
    return Buffer.from(hex, 'hex');
  }
}
