/**
 * 주요 활동 지역 DTO
 */

/**
 * 지역 정보 응답
 */
export interface RegionDto {
  regionId: number;
  city: string;
  district: string;
}

/**
 * 사용자 주요 활동 지역 응답
 */
export interface UserPreferredRegionResponseDto {
  regions: RegionDto[];
  count: number;
}

/**
 * 주요 활동 지역 추가 요청
 */
export interface AddPreferredRegionRequestDto {
  regionId: number;
}

/**
 * 주요 활동 지역 추가 응답
 */
export interface AddPreferredRegionResponseDto {
  userId: string;
  regionId: number;
  city: string;
  district: string;
  createdAt: string;
}

/**
 * 지역 목록 조회 응답 (검색용)
 */
export interface RegionListResponseDto {
  regions: RegionDto[];
  total: number;
}
