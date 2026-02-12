import { RegionInterface } from '../DTO/region_dto';
import { RegionRepository } from '../repository/region_repository';

export class RegionService {
  private regionRepository = new RegionRepository();

  async searchRegion(query: string): Promise<RegionInterface[]> {
    if (!query.trim()) return [];
    const result = await this.regionRepository.findRegionsByKeyword(query);

    return result;
  }
}
