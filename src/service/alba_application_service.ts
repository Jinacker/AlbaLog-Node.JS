import { findAlbaDetail,applyAlba} from "../repository/alba_application_repository";
import { AlbaApplyRequestDto, AlbaApplyResponseDto, AlbaDetailResponseDto } from "../DTO/alba_application_dto";

/**
 * 대타 아르바이트 정보 상세 조회 서비스
 * @param userId 
 * @returns 대타 아르바이트 상세정보
 */

export const getAlbaDetail = async (albaId:string):Promise<AlbaDetailResponseDto> =>{
    const result = await findAlbaDetail(albaId);
    return result;
}

/**
 * 대타 아르바이트 지원 서비스
 * @param albaId 
 * @param userId 
 * @returns 알바, 유저Id와 정산여부, 진행과정
 */
export const postAlbaApplication = async(data:AlbaApplyRequestDto):Promise<AlbaApplyResponseDto>=>{
    const {albaId,userId} = data
    const result = await applyAlba(albaId,userId);

    return {
        albaId,
        userId,
        processStatus:result.process_status,
        settlementStatus:result.settlement_status
    }
}