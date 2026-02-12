import { findAlbaDetail,applyAlba} from "../repository/alba_application_repository";
import { AlbaApplyResponseDto, AlbaDetailResponseDto } from "../DTO/alba_application_dto";
import { bufferToUuid } from "../util/uuid_util";

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
 * @param albaBuffer 
 * @param userBuffer
 * @returns 알바, 유저Id와 정산여부, 진행과정
 */
export const postAlbaApplication = async(userBuffer:Buffer,albaBuffer:Buffer):Promise<AlbaApplyResponseDto>=>{
    
    const result = await applyAlba(userBuffer,albaBuffer);


    return {
        albaId:bufferToUuid(albaBuffer),
        userId:bufferToUuid(userBuffer),
        processStatus:result.process_status,
        settlementStatus:result.settlement_status
    }
}