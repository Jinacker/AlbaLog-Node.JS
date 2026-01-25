import prisma from '../config/prisma';
import { UserNotFoundError } from '../DTO/error_dto';

/**
 * User Repository
 * 사용자 관련 데이터베이스 접근 계층
 */
class UserRepository {
  /**
   * 사용자 ID로 사용자 정보 조회
   * @param userId - 사용자 ID (Binary(16) UUID)
   * @returns 사용자 정보
   */
  async findUserById(userId: Uint8Array): Promise<{
    user_id: Uint8Array;
    user_name: string | null;
    user_birth: Date | null;
    gender: 'male' | 'female' | null;
    profile_image: string | null;
    income_goal: number | null;
    email: string;
    settlement_info: {
      user_id: Uint8Array;
      bank_name: string | null;
      account_number: string | null;
      account_holder: string | null;
    } | null;
  }> {
    const user = await prisma.user.findUnique({
      where: { user_id: userId as Uint8Array<ArrayBuffer> },
      include: {
        settlement_info: true, // 정산 정보 포함
      },
    });

    if (!user) {
      throw new UserNotFoundError('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  /**
   * 사용자 정보 수정
   * @param userId - 사용자 ID
   * @param data - 수정할 데이터
   * @returns 수정된 사용자 정보
   */
  async updateUser(
    userId: Uint8Array,
    data: {
      user_name?: string;
      user_birth?: Date;
      gender?: 'male' | 'female';
      profile_image?: string;
    },
  ): Promise<{
    user_id: Uint8Array;
    user_name: string | null;
    user_birth: Date | null;
    gender: 'male' | 'female' | null;
    profile_image: string | null;
    income_goal: number | null;
    email: string;
  }> {
    return await prisma.user.update({
      where: { user_id: userId as Uint8Array<ArrayBuffer> },
      data,
    });
  }

  /**
   * 사용자의 총 근무 횟수 조회
   * @param userId - 사용자 ID
   * @returns 총 근무 횟수
   */
  async getUserWorkCount(userId: Uint8Array): Promise<number> {
    return await prisma.user_work_log.count({
      where: {
        user_id: userId as Uint8Array<ArrayBuffer>,
        status: 'done', // 완료된 근무만 카운트
      },
    });
  }

  /**
   * 사용자가 받은 평균 평점 조회 (신뢰 지표)
   * @param userId - 사용자 ID
   * @returns 평균 평점 (0~5점)
   */
  async getUserAverageRating(userId: Uint8Array): Promise<number> {
    const result = await prisma.store_review.aggregate({
      where: { user_id: userId as Uint8Array<ArrayBuffer> },
      _avg: { total_score: true },
      _count: true,
    });

    if (result._count === 0) {
      return 0; // 리뷰가 없으면 0점
    }

    const average = result._avg.total_score ?? 0;
    return Math.round(average * 10) / 10; // 소수점 첫째자리까지
  }

  /**
   * 사용자의 정산 정보 조회
   * @param userId - 사용자 ID
   * @returns 정산 정보 (은행명, 계좌번호, 예금주)
   */
  async getSettlementInfo(userId: Uint8Array): Promise<{
    user_id: Uint8Array;
    bank_name: string | null;
    account_number: string | null;
    account_holder: string | null;
  } | null> {
    return await prisma.settlement_info.findUnique({
      where: { user_id: userId as Uint8Array<ArrayBuffer> },
    });
  }

  /**
   * 사용자의 정산 정보 수정
   * @param userId - 사용자 ID
   * @param data - 정산 정보
   */
  async updateSettlementInfo(
    userId: Uint8Array,
    data: {
      bank_name?: string;
      account_number?: string;
      account_holder?: string;
    },
  ): Promise<{
    user_id: Uint8Array;
    bank_name: string | null;
    account_number: string | null;
    account_holder: string | null;
  }> {
    return await prisma.settlement_info.upsert({
      where: { user_id: userId as Uint8Array<ArrayBuffer> },
      update: data,
      create: {
        user_id: userId as Uint8Array<ArrayBuffer>,
        ...data,
      },
    });
  }
}

export default new UserRepository();
