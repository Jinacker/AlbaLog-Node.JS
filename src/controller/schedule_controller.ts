import { Controller, Post, Route, Tags, Body, SuccessResponse, Response, Request, Security } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import ScheduleService from '../service/schedule_service';
import { CreateScheduleRequestDto, ScheduleResponseDto } from '../DTO/schedule_dto';
import { TsoaSuccessResponse } from '../config/response_interface';

/**
 * Schedule Controller
 * 알바 일정 관련 API
 *
 * 홈화면에서 간단하게 새 알바 일정을 추가할 수 있는 기능을 제공합니다.
 * 입력 항목: 근무지, 날짜, 시작/종료 시간, 시급, 메모
 */
@Route('api/schedules')
@Tags('Schedule')
export class ScheduleController extends Controller {
  /**
   * 새 알바 일정 추가 (홈화면 간단 추가)
   *
   * 홈화면에서 빠르게 알바 일정을 추가할 때 사용합니다.
   * 근무지, 날짜, 시간, 시급 정보를 입력받아 일정을 생성합니다.
   *
   * @param requestBody - 일정 생성 요청 데이터
   * @returns 생성된 일정 정보 (예상 금액 포함)
   */
  @Post('')
  @Security('jwt')
  @SuccessResponse('201', '알바 일정 추가 성공')
  @Response(400, 'Bad Request - 필수 입력값 누락')
  @Response(401, 'Unauthorized')
  @Response(500, 'Internal Server Error')
  public async createSchedule(
    @Request() req: ExpressRequest,
    @Body() requestBody: CreateScheduleRequestDto,
  ): Promise<TsoaSuccessResponse<ScheduleResponseDto>> {
    // 1. 필수 입력값 검증
    this.validateRequest(requestBody);

    // 2. JWT에서 userId 추출 후 Buffer로 변환
    const userId = (req.user as unknown as { id: string }).id;
    const userIdBuffer = this.uuidToBuffer(userId);

    // 3. 일정 생성 서비스 호출
    const schedule = await ScheduleService.createSchedule(userIdBuffer, requestBody);

    // 4. 201 Created 상태 코드 설정
    this.setStatus(201);

    // 5. 성공 응답 반환
    return new TsoaSuccessResponse(schedule);
  }

  /**
   * 요청 데이터 유효성 검증
   * @param data - 검증할 요청 데이터
   * @throws Error - 필수 값이 누락된 경우
   */
  private validateRequest(data: CreateScheduleRequestDto): void {
    // 근무지 검증
    if (!data.workplace || data.workplace.trim() === '') {
      this.setStatus(400);
      throw new Error('근무지를 입력해주세요.');
    }

    // 날짜 검증
    if (!data.workDate || data.workDate.trim() === '') {
      this.setStatus(400);
      throw new Error('근무 날짜를 선택해주세요.');
    }

    // 시작 시간 검증
    if (!data.startTime || data.startTime.trim() === '') {
      this.setStatus(400);
      throw new Error('시작 시간을 입력해주세요.');
    }

    // 종료 시간 검증
    if (!data.endTime || data.endTime.trim() === '') {
      this.setStatus(400);
      throw new Error('종료 시간을 입력해주세요.');
    }

    // 시급 검증 (0보다 커야 함)
    if (!data.hourlyWage || data.hourlyWage <= 0) {
      this.setStatus(400);
      throw new Error('올바른 시급을 입력해주세요.');
    }

    // 시간 순서 검증 (시작 시간이 종료 시간보다 이전이어야 함)
    if (data.startTime >= data.endTime) {
      this.setStatus(400);
      throw new Error('종료 시간은 시작 시간 이후여야 합니다.');
    }
  }

  /**
   * UUID 문자열을 Uint8Array로 변환
   * @param uuid - UUID 문자열 (예: "550e8400-e29b-41d4-a716-446655440000")
   * @returns Uint8Array
   */
  private uuidToBuffer(uuid: string): Uint8Array {
    const hex = uuid.replace(/-/g, '');
    return Buffer.from(hex, 'hex');
  }
}
