/**
 * 프로필 조회 응답 DTO
 */
export interface ProfileResponseDto {
  userId: string;
  userName: string;
  userBirth: string; // "1995-03-15" 형식
  age: number;
  gender: 'male' | 'female';
  profileImage?: string;
  address?: string; // 주요 활동 지역

  // 알바 경력 (총 근무 횟수)
  totalWorkCount: number;

  // 신뢰 지표 (평균 평점)
  trustScore: number; // 0~5점

  // 활동 배지 목록
  badges: BadgeDto[];

  // 대표 이력
  representativeHistory?: WorkHistoryDto;
}

/**
 * 배지 정보
 */
export interface BadgeDto {
  badgeId: string;
  badgeName: string;
  badgeDescription: string;
  achievedAt: string; // ISO 8601 날짜
}

/**
 * 근무 이력 정보
 */
export interface WorkHistoryDto {
  storeName: string;
  workPeriod: string; // "2024.01 ~ 2024.12"
  totalWorkDays: number;
}

/**
 * 프로필 수정 요청 DTO
 */
export interface UpdateProfileRequestDto {
  userName?: string;
  userBirth?: string;
  gender?: 'male' | 'female';
  profileImage?: string;
}
