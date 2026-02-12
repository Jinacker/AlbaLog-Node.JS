import UserPreferredRegionRepository from '../repository/user_preferred_region_repository';
import {
  UserPreferredRegionResponseDto,
  AddPreferredRegionResponseDto,
  RegionDto,
  RegionListResponseDto,
} from '../DTO/user_preferred_region_dto';
import { bufferToUuid } from '../util/uuid_util';

/**
 * 주요 활동 지역 Service
 */
class UserPreferredRegionService {
  private readonly MAX_REGIONS = 3; // 최대 3개 지역 설정 가능

  /**
   * 사용자의 주요 활동 지역 목록 조회
   * @param userId 사용자 ID (Buffer)
   */
  async getPreferredRegions(userId: Uint8Array): Promise<UserPreferredRegionResponseDto> {
    const regions = await UserPreferredRegionRepository.findByUserId(userId);

    const regionDtos: RegionDto[] = regions.map((item) => ({
      regionId: item.region.region_id,
      city: item.region.city || '',
      district: item.region.district || '',
    }));

    return {
      regions: regionDtos,
      count: regionDtos.length,
    };
  }

  /**
   * 주요 활동 지역 추가
   * @param userId 사용자 ID (Buffer)
   * @param regionId 지역 ID (number)
   */
  async addPreferredRegion(
    userId: Uint8Array,
    regionId: number,
  ): Promise<AddPreferredRegionResponseDto> {
    // 1. 지역이 존재하는지 확인
    const region = await UserPreferredRegionRepository.findRegionById(regionId);
    if (!region) {
      throw new Error('존재하지 않는 지역입니다.');
    }

    // 2. 이미 등록된 지역인지 확인
    const exists = await UserPreferredRegionRepository.exists(userId, regionId);
    if (exists) {
      throw new Error('이미 등록된 지역입니다.');
    }

    // 3. 최대 개수 확인
    const count = await UserPreferredRegionRepository.countByUserId(userId);
    if (count >= this.MAX_REGIONS) {
      throw new Error(`주요 활동 지역은 최대 ${this.MAX_REGIONS}개까지 설정할 수 있습니다.`);
    }

    // 4. 추가
    const created = await UserPreferredRegionRepository.create(userId, regionId);

    return {
      userId: bufferToUuid(created.user_id),
      regionId: created.region_id,
      city: created.region.city || '',
      district: created.region.district || '',
      createdAt: created.created_at.toISOString(),
    };
  }

  /**
   * 주요 활동 지역 삭제
   * @param userId 사용자 ID (Buffer)
   * @param regionId 지역 ID (number)
   */
  async removePreferredRegion(userId: Uint8Array, regionId: number): Promise<void> {
    // 등록된 지역인지 확인
    const exists = await UserPreferredRegionRepository.exists(userId, regionId);
    if (!exists) {
      throw new Error('등록되지 않은 지역입니다.');
    }

    await UserPreferredRegionRepository.delete(userId, regionId);
  }

  /**
   * 지역 목록 검색
   * @param city 시/도 (선택)
   * @param district 구/군 (선택)
   */
  async searchRegions(city?: string, district?: string): Promise<RegionListResponseDto> {
    const regions = await UserPreferredRegionRepository.searchRegions(city, district);

    const regionDtos: RegionDto[] = regions.map((item) => ({
      regionId: item.region_id,
      city: item.city || '',
      district: item.district || '',
    }));

    return {
      regions: regionDtos,
      total: regionDtos.length,
    };
  }
}

export default new UserPreferredRegionService();
