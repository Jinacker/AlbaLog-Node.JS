import prisma from '../config/prisma';

export class RegionRepository {
  async findRegionsByKeyword(keyword: string) {
    // 공백을 기준으로 city와 district 검색
    // 예: "서울 강" -> city: 서울, district: 강%
    const parts = keyword.split(' ').filter((p) => p.length > 0);
    const cityPart = parts[0];
    const districtPart = parts[1] || '';

    return prisma.region.findMany({
      where: {
        city: { startsWith: cityPart },
        district: { startsWith: districtPart },
      },
      select: {
        region_id: true,
        city: true,
        district: true,
      },
      take: 10, // 실시간 검색이므로 상위 10개로 제한하여 성능 확보
    });
  }
}
