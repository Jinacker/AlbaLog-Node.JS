import { findAlbaStatus } from "../repository/alba_status_repository";
import { AlbaStatusDTO } from "../DTO/alba_status_dto";

/**
 * 사용자별 알바 지원 현황 조회 및 데이터 가공
 * @param userId - 사용자 ID (UUID 문자열)
 * @param type - 조회 타입 (all, active, closed)
 * @returns 가공된 알바 상태 리스트
 */
export const fetchAlbaStatus=async(userId:Buffer,type:string):Promise<AlbaStatusDTO[]>=>{

    //repository에서 type에 맞는 사용자 미션 리스트 가져옴
    const statusList=await findAlbaStatus(userId,type)

    return statusList.map((item)=>{
        const{alba_posting,process_status}=item;
        const{store,work_schedule}=alba_posting??{}
        return{
        storeName:store?.store_name??'매장정보없음',
        workDate:work_schedule?.work_date?work_schedule.work_date.toISOString().split('T')[0]:'',
        dayOfWeek:work_schedule?.day_of_week??'',
        startTime: work_schedule?.start_time?work_schedule.start_time.toISOString().split('T')[1].substring(0,5):'',
        endTime:work_schedule?.end_time?work_schedule.end_time.toISOString().split('T')[1].substring(0,5):'',
        processStatus:process_status
        };
    });
}