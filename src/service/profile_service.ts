import UserRepository from '../repository/user_repository';
import { ProfileResponseDto, UpdateProfileRequestDto } from '../DTO/profile_dto';
import { bufferToUuid } from '../util/uuid_util';
import { formatDate, calculateAge } from '../util/date_util';

/**
 * Profile Service
 * 프로필 관련 비즈니스 로직 처리
 */
class ProfileService {
  /**
   * 프로필 조회
   * @param userId - 사용자 ID (Buffer 형식)
   * @returns 프로필 정보
   */
  async getProfile(userId: Uint8Array): Promise<ProfileResponseDto> {
    // 1. Repository에서 사용자 정보 가져오기
    const user = await UserRepository.findUserById(userId);

    // 2. 총 근무 횟수 가져오기
    const totalWorkCount = await UserRepository.getUserWorkCount(userId);

    // 3. 평균 평점 (신뢰 지표) 가져오기
    const trustScore = await UserRepository.getUserAverageRating(userId);

    // 4. 생년월일에서 나이 계산
    const age = calculateAge(user.user_birth);

    // 5. DTO 형식으로 변환해서 반환
    return {
      userId: bufferToUuid(user.user_id),
      userName: user.user_name || '',
      userBirth: user.user_birth ? formatDate(user.user_birth) : '',
      age,
      gender: user.gender || 'male',
      profileImage: user.profile_image || undefined,
      address: undefined, // TODO: 주요 활동 지역 연결
      totalWorkCount,
      trustScore,
      badges: [], // TODO: 배지 기능 구현 시 추가
      representativeHistory: undefined, // TODO: 대표 이력 기능 구현 시 추가
    };
  }

  /**
   * 프로필 수정
   * @param userId - 사용자 ID
   * @param data - 수정할 데이터
   * @returns 수정된 프로필 정보
   */
  async updateProfile(
    userId: Uint8Array,
    data: UpdateProfileRequestDto,
  ): Promise<ProfileResponseDto> {
    // 1. 데이터 변환 (DTO → DB 형식)
    const updateData: {
      user_name?: string;
      user_birth?: Date;
      gender?: 'male' | 'female';
      profile_image?: string;
    } = {};

    if (data.userName) {
      updateData.user_name = data.userName;
    }
    if (data.userBirth) {
      updateData.user_birth = new Date(data.userBirth);
    }
    if (data.gender) {
      updateData.gender = data.gender;
    }
    if (data.profileImage) {
      updateData.profile_image = data.profileImage;
    }

    // 2. Repository를 통해 DB 업데이트
    await UserRepository.updateUser(userId, updateData);

    // 3. 업데이트된 프로필 조회 후 반환
    return this.getProfile(userId);
  }
}

export default new ProfileService();
