import {
  Controller,
  Get,
  Post,
  Delete,
  Route,
  Tags,
  Path,
  Body,
  Query,
  SuccessResponse,
  Response,
  Security,
  Request,
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import UserPreferredRegionService from '../service/user_preferred_region_service';
import {
  UserPreferredRegionResponseDto,
  AddPreferredRegionRequestDto,
  AddPreferredRegionResponseDto,
  RegionListResponseDto,
} from '../DTO/user_preferred_region_dto';
import { TsoaSuccessResponse } from '../config/response_interface';
import { uuidToBuffer } from '../util/uuid_util';

/**
 * 주요 활동 지역 Controller
 * 설정 > 주요 활동 지역 설정
 */
@Route('api/users')
@Tags('User Preferred Region')
export class UserPreferredRegionController extends Controller {
  /**
   * 주요 활동 지역 목록 조회 API
   * @param req Express Request (JWT에서 userId 추출)
   * @returns 주요 활동 지역 목록
   */
  @Get('me/preferred-regions')
  @Security('jwt')
  @SuccessResponse('200', '주요 활동 지역 조회 성공')
  @Response(401, 'Unauthorized')
  @Response(500, 'Internal Server Error')
  public async getPreferredRegions(
    @Request() req: ExpressRequest,
  ): Promise<TsoaSuccessResponse<UserPreferredRegionResponseDto>> {
    const userId = (req.user as unknown as { id: string }).id;

    const userIdBuffer = uuidToBuffer(userId);
    const result = await UserPreferredRegionService.getPreferredRegions(userIdBuffer);

    return new TsoaSuccessResponse(result);
  }

  /**
   * 주요 활동 지역 추가 API
   * @param req Express Request (JWT에서 userId 추출)
   * @param requestBody 추가할 지역 정보
   * @returns 추가된 지역 정보
   */
  @Post('me/preferred-regions')
  @Security('jwt')
  @SuccessResponse('201', '주요 활동 지역 추가 성공')
  @Response(400, 'Bad Request - 최대 3개까지 설정 가능')
  @Response(401, 'Unauthorized')
  @Response(404, 'Region Not Found')
  @Response(409, 'Conflict - 이미 등록된 지역')
  @Response(500, 'Internal Server Error')
  public async addPreferredRegion(
    @Request() req: ExpressRequest,
    @Body() requestBody: AddPreferredRegionRequestDto,
  ): Promise<TsoaSuccessResponse<AddPreferredRegionResponseDto>> {
    const userId = (req.user as unknown as { id: string }).id;

    const userIdBuffer = uuidToBuffer(userId);

    try {
      const result = await UserPreferredRegionService.addPreferredRegion(
        userIdBuffer,
        requestBody.regionId,
      );
      this.setStatus(201);
      return new TsoaSuccessResponse(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('존재하지 않는')) {
          this.setStatus(404);
        } else if (error.message.includes('이미 등록된')) {
          this.setStatus(409);
        } else if (error.message.includes('최대')) {
          this.setStatus(400);
        }
      }
      throw error;
    }
  }

  /**
   * 주요 활동 지역 삭제 API
   * @param req Express Request (JWT에서 userId 추출)
   * @param regionId 지역 ID (숫자)
   */
  @Delete('me/preferred-regions/{regionId}')
  @Security('jwt')
  @SuccessResponse('204', '주요 활동 지역 삭제 성공')
  @Response(400, 'Bad Request')
  @Response(401, 'Unauthorized')
  @Response(404, 'Not Found - 등록되지 않은 지역')
  @Response(500, 'Internal Server Error')
  public async removePreferredRegion(
    @Request() req: ExpressRequest,
    @Path() regionId: number,
  ): Promise<void> {
    const userId = (req.user as unknown as { id: string }).id;

    const userIdBuffer = uuidToBuffer(userId);

    try {
      await UserPreferredRegionService.removePreferredRegion(userIdBuffer, regionId);
      this.setStatus(204);
    } catch (error) {
      if (error instanceof Error && error.message.includes('등록되지 않은')) {
        this.setStatus(404);
      }
      throw error;
    }
  }
}

/**
 * 지역 검색 Controller
 */
@Route('api/regions')
@Tags('Region')
export class RegionsController extends Controller {
  /**
   * 지역 목록 검색 API
   * @param city 시/도 (선택)
   * @param district 구/군 (선택)
   * @returns 지역 목록
   */
  @Get('')
  @SuccessResponse('200', '지역 목록 조회 성공')
  @Response(500, 'Internal Server Error')
  public async searchRegions(
    @Query() city?: string,
    @Query() district?: string,
  ): Promise<TsoaSuccessResponse<RegionListResponseDto>> {
    const result = await UserPreferredRegionService.searchRegions(city, district);
    return new TsoaSuccessResponse(result);
  }
}
