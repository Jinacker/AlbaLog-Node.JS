import UserRepository from '../repository/user_repository';
import { SettlementResponseDto, UpdateSettlementRequestDto } from '../DTO/settlement_dto';

/**
 * Settlement Service
 * 계좌(정산) 정보 관련 비즈니스 로직 처리
 */
class SettlementService {
  /**
   * 계좌 정보 조회
   * @param userId - 사용자 ID (Buffer 형식)
   * @returns 계좌 정보
   */
  async getSettlement(userId: Uint8Array): Promise<SettlementResponseDto> {
    // 1. Repository에서 정산 정보 가져오기
    const settlement = await UserRepository.getSettlementInfo(userId);

    // 2. DTO 형식으로 변환해서 반환
    return {
      bankName: settlement?.bank_name || null,
      accountNumber: settlement?.account_number || null,
      accountHolder: settlement?.account_holder || null,
    };
  }

  /**
   * 계좌 정보 수정
   * @param userId - 사용자 ID
   * @param data - 수정할 데이터
   * @returns 수정된 계좌 정보
   */
  async updateSettlement(
    userId: Uint8Array,
    data: UpdateSettlementRequestDto,
  ): Promise<SettlementResponseDto> {
    // 1. 데이터 변환 (DTO → DB 형식)
    const updateData: {
      bank_name?: string;
      account_number?: string;
      account_holder?: string;
    } = {};

    if (data.bankName) {
      updateData.bank_name = data.bankName;
    }
    if (data.accountNumber) {
      updateData.account_number = data.accountNumber;
    }
    if (data.accountHolder) {
      updateData.account_holder = data.accountHolder;
    }

    // 2. Repository를 통해 DB 업데이트
    await UserRepository.updateSettlementInfo(userId, updateData);

    // 3. 업데이트된 정보 조회 후 반환
    return this.getSettlement(userId);
  }
}

export default new SettlementService();
