/**
 * Place DTO
 * 카카오 로컬 API 장소 검색 관련 DTO
 */

/**
 * 장소 검색 요청 DTO
 */
export interface SearchPlaceRequestDto {
  /** 검색 키워드 (예: "메가MGC커피 상수역점") */
  query: string;

  /** 중심 좌표 X (경도, 선택) */
  x?: string;

  /** 중심 좌표 Y (위도, 선택) */
  y?: string;

  /** 반경 (미터 단위, 최대 20000, 선택) */
  radius?: number;

  /** 페이지 번호 (1~45, 기본값 1) */
  page?: number;

  /** 한 페이지 결과 수 (1~15, 기본값 15) */
  size?: number;
}

/**
 * 장소 정보 응답 DTO
 */
export interface PlaceResponseDto {
  /** 장소 ID */
  id: string;

  /** 장소명 */
  placeName: string;

  /** 카테고리 이름 */
  categoryName: string;

  /** 전화번호 */
  phone: string;

  /** 지번 주소 */
  addressName: string;

  /** 도로명 주소 */
  roadAddressName: string;

  /** X 좌표 (경도) */
  x: string;

  /** Y 좌표 (위도) */
  y: string;

  /** 카카오맵 장소 상세페이지 URL */
  placeUrl: string;

  /** 중심좌표까지의 거리 (미터) */
  distance?: string;
}

/**
 * 장소 검색 결과 응답 DTO
 */
export interface SearchPlaceResponseDto {
  /** 검색된 총 문서 수 */
  totalCount: number;

  /** 노출 가능 문서 수 (최대 45) */
  pageableCount: number;

  /** 마지막 페이지 여부 */
  isEnd: boolean;

  /** 장소 목록 */
  places: PlaceResponseDto[];
}
