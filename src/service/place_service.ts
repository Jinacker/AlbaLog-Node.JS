import axios from 'axios';
import { SearchPlaceRequestDto, SearchPlaceResponseDto, PlaceResponseDto } from '../DTO/place_dto';

/**
 * 카카오 API 장소 검색 응답 타입
 */
interface KakaoPlaceDocument {
  id: string;
  place_name: string;
  category_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
  distance: string;
}

interface KakaoPlaceMeta {
  total_count: number;
  pageable_count: number;
  is_end: boolean;
}

interface KakaoPlaceResponse {
  meta: KakaoPlaceMeta;
  documents: KakaoPlaceDocument[];
}

/**
 * Place Service
 * 카카오 로컬 API를 사용한 장소 검색 서비스
 */
class PlaceService {
  // 카카오 로컬 API 기본 URL
  private readonly KAKAO_API_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';

  // 환경변수에서 카카오 REST API 키 가져오기
  private readonly KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY;

  /**
   * 키워드로 장소 검색
   * 카카오 로컬 API를 호출하여 장소 정보를 반환
   *
   * @param params - 검색 파라미터 (query 필수)
   * @returns 장소 검색 결과
   */
  async searchPlace(params: SearchPlaceRequestDto): Promise<SearchPlaceResponseDto> {
    // 1. API 키 확인
    if (!this.KAKAO_API_KEY) {
      throw new Error('KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다.');
    }

    // 2. 카카오 API 호출
    const response = await axios.get<KakaoPlaceResponse>(this.KAKAO_API_URL, {
      headers: {
        Authorization: `KakaoAK ${this.KAKAO_API_KEY}`,
      },
      params: {
        query: params.query,
        x: params.x,
        y: params.y,
        radius: params.radius,
        page: params.page || 1,
        size: params.size || 15,
      },
    });

    // 3. 응답 데이터 변환
    const { meta, documents } = response.data;

    // 4. DTO 형식으로 변환하여 반환
    const places: PlaceResponseDto[] = documents.map((doc) => ({
      id: doc.id,
      placeName: doc.place_name,
      categoryName: doc.category_name,
      phone: doc.phone || '',
      addressName: doc.address_name,
      roadAddressName: doc.road_address_name || '',
      x: doc.x,
      y: doc.y,
      placeUrl: doc.place_url,
      distance: doc.distance || '',
    }));

    return {
      totalCount: meta.total_count,
      pageableCount: meta.pageable_count,
      isEnd: meta.is_end,
      places,
    };
  }
}

export default new PlaceService();
