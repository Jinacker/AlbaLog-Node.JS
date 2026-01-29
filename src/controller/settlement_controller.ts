import { Controller, Get, Put, Route, Tags, Path, Body, SuccessResponse, Response } from 'tsoa';
import SettlementService from '../service/settlement_service';
import { SettlementResponseDto, UpdateSettlementRequestDto } from '../DTO/settlement_dto';
import { TsoaSuccessResponse } from '../config/response_interface';

/**
 * Settlement Controller
 * 계좌(정산) 정보 API
 */
@Route('api/users')
@Tags('Settlement')
export class SettlementController extends Controller {
  /**
   * 계좌 정보 조회
   * @param userId - 사용자 ID (UUID 문자열)
   * @returns 계좌 정보
   */
  @Get('{userId}/settlement')
  @SuccessResponse('200', '계좌 정보 조회 성공')
  @Response(404, 'User Not Found')
  @Response(500, 'Internal Server Error')
  public async getSettlement(
    @Path() userId: string,
  ): Promise<TsoaSuccessResponse<SettlementResponseDto>> {
    const userIdBuffer = this.uuidToBuffer(userId);
    const settlement = await SettlementService.getSettlement(userIdBuffer);
    return new TsoaSuccessResponse(settlement);
  }

  /**
   * 계좌 정보 수정
   * @param userId - 사용자 ID (UUID 문자열)
   * @param requestBody - 수정할 계좌 정보
   * @returns 수정된 계좌 정보
   */
  @Put('{userId}/settlement')
  @SuccessResponse('200', '계좌 정보 수정 성공')
  @Response(400, 'Bad Request')
  @Response(404, 'User Not Found')
  @Response(500, 'Internal Server Error')
  public async updateSettlement(
    @Path() userId: string,
    @Body() requestBody: UpdateSettlementRequestDto,
  ): Promise<TsoaSuccessResponse<SettlementResponseDto>> {
    const userIdBuffer = this.uuidToBuffer(userId);
    const settlement = await SettlementService.updateSettlement(userIdBuffer, requestBody);
    return new TsoaSuccessResponse(settlement);
  }

  /**
   * UUID 문자열을 Uint8Array로 변환
   */
  private uuidToBuffer(uuid: string): Uint8Array {
    const hex = uuid.replace(/-/g, '');
    return Buffer.from(hex, 'hex');
  }
}
