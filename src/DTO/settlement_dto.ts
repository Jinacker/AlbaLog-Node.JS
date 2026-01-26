/**
 * 계좌(정산) 정보 응답 DTO
 * 서버 → 클라이언트
 */
export interface SettlementResponseDto {
  bankName: string | null;      // 은행명
  accountNumber: string | null; // 계좌번호
  accountHolder: string | null; // 예금주
}

/**
 * 계좌(정산) 정보 수정 요청 DTO
 * 클라이언트 → 서버
 */
export interface UpdateSettlementRequestDto {
  bankName?: string;      // 수정할 은행명
  accountNumber?: string; // 수정할 계좌번호
  accountHolder?: string; // 수정할 예금주
}
