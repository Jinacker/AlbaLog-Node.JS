import prisma from '../config/prisma';

/**
 * 주요 활동 지역 Repository
 */
class UserPreferredRegionRepository {
  /**
   * 사용자의 주요 활동 지역 목록 조회
   * @param userId 사용자 ID (Buffer)
   */
  async findByUserId(userId: Uint8Array) {
    return await prisma.user_preferred_region.findMany({
      where: {
        user_id: userId as Uint8Array<ArrayBuffer>,
      },
      include: {
        region: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * 사용자의 주요 활동 지역 개수 조회
   * @param userId 사용자 ID (Buffer)
   */
  async countByUserId(userId: Uint8Array): Promise<number> {
    return await prisma.user_preferred_region.count({
      where: {
        user_id: userId as Uint8Array<ArrayBuffer>,
      },
    });
  }

  /**
   * 주요 활동 지역 추가
   * @param userId 사용자 ID (Buffer)
   * @param regionId 지역 ID (number)
   */
  async create(userId: Uint8Array, regionId: number) {
    return await prisma.user_preferred_region.create({
      data: {
        user_id: userId as Uint8Array<ArrayBuffer>,
        region_id: regionId,
      },
      include: {
        region: true,
      },
    });
  }

  /**
   * 주요 활동 지역 삭제
   * @param userId 사용자 ID (Buffer)
   * @param regionId 지역 ID (number)
   */
  async delete(userId: Uint8Array, regionId: number) {
    return await prisma.user_preferred_region.delete({
      where: {
        region_id_user_id: {
          user_id: userId as Uint8Array<ArrayBuffer>,
          region_id: regionId,
        },
      },
    });
  }

  /**
   * 특정 지역이 이미 등록되어 있는지 확인
   * @param userId 사용자 ID (Buffer)
   * @param regionId 지역 ID (number)
   */
  async exists(userId: Uint8Array, regionId: number): Promise<boolean> {
    const result = await prisma.user_preferred_region.findUnique({
      where: {
        region_id_user_id: {
          user_id: userId as Uint8Array<ArrayBuffer>,
          region_id: regionId,
        },
      },
    });
    return result !== null;
  }

  /**
   * 지역 정보 조회 (ID로)
   * @param regionId 지역 ID (number)
   */
  async findRegionById(regionId: number) {
    return await prisma.region.findUnique({
      where: {
        region_id: regionId,
      },
    });
  }

  /**
   * 지역 목록 검색 (시/도, 구/군으로)
   * @param city 시/도 (선택)
   * @param district 구/군 (선택)
   */
  async searchRegions(city?: string, district?: string) {
    return await prisma.region.findMany({
      where: {
        ...(city && { city: { contains: city } }),
        ...(district && { district: { contains: district } }),
      },
      orderBy: [{ city: 'asc' }, { district: 'asc' }],
    });
  }
}

export default new UserPreferredRegionRepository();
