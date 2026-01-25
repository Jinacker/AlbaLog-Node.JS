import prisma from "../config/prisma"
/**
 * userId로 알바 진행 상태 조회
 * @param userId 
 * @param type  전체(all),진행중(active),모집완료(closed)
 * @returns 알바 상태(진행중(waiting), 모집완료(accepted, rejected))
 */
export const findAlbaStatus=async(userId:Buffer,type:string)=>{

    return await prisma.user_alba.findMany({
        where:{
            user_id: new Uint8Array(userId),
            process_status: 
            type==='all'?undefined
            :type==='active'?'waiting'
            : { in: ['accepted', 'rejected'] },
        },
        include:{
            alba_posting:{
                include:{
                    store:true,
                    work_schedule:true,
                }
            }
        },
        //날짜, 시작시간 순서 정렬
        orderBy:[{alba_posting:{work_schedule:{work_date:'asc'}}},
                {alba_posting:{work_schedule:{start_time:'asc'}}}
    ]})
}