import { SearchAlbaRequestDto, SearchAlbaResponseDto } from "../DTO/search_alba_dto";
import { findCategoryById, findPostingByFilter } from "../repository/search_alba_repository";
import { formatDate,formatTime } from '../util/date_util';

/**
 * 필터 기본 조건 설정 및 조회
 * @param params 
 * @returns 조건에 맞는 알바 리스트
 */
export const getFilteredAlba = async (params:SearchAlbaRequestDto,userBuffer:Buffer):Promise<SearchAlbaResponseDto[]>=>{
    let storeCategoryId:number|undefined
    //문자로 받은 카테고리를 카테고리 id로 변환
    if(params.storeCategory){
        storeCategoryId=await findCategoryById(params.storeCategory)
    }
    //workDate 설정이 안되어있으면 오늘 날짜 기준으로 변경
    if(!params.workDate){
        params.workDate=formatDate(new Date());
    } 

    const posting = await findPostingByFilter({
        ...params,
        storeCategoryId,
        userBuffer
    })
    let result = posting
    //요청으로 들어온 시간과 공고 시간 비교
     if(params.workTime&&params.workTime.includes('~')){
        //"00:00~00:00" 형태로 받을 것을 고려. 
        // 프론트에서 다른 형태로 준다면 그에 맞춰 수정
        const [requestStart,requestEnd] = params.workTime.split('~')
        result=posting.filter((post)=>{
            const dbStart=formatTime(post.startTime)
            const dbEnd=formatTime(post.endTime)
            //요청시간과 공고 시간 비교
            return dbStart >= requestStart && dbEnd <= requestEnd;
        })
    }
    return result
}