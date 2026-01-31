import prisma from "../config/prisma";

/**
 * 대타 아르바이트 상세 정보 조회
 * @param albaId 
 * @returns 대타 아르바이트 상세 정보
 */
export const findAlbaDetail = async (albaId:string)=>{
    //albaId Buffer로 변환. Todo: 유틸 함수 사용해서 가독성 개선시키기
    const albaBuffer=Buffer.from(albaId.replace(/-/g,""),'hex');
    //albaId로 관련된 store, work_schedule 조회
    const result = await prisma.alba_posting.findUnique({
        where:{alba_id:albaBuffer},
        include:{
            work_schedule:true,
            store:{
                include:{
                    store_review:true
                }
            }
        }
    })
    if (!result) {
        throw new Error("존재하지 않는 알바 공고입니다.");
    }
    
    if (!result.work_schedule) {
        throw new Error("알바 스케줄 정보를 찾을 수 없습니다.");
    }
    const {work_schedule,store,requirement,notification,main_task,total_wage,hourly_rate} = result
    const {work_date,work_time,start_time,end_time,day_of_week}=work_schedule
    //date인 것들 string으로 변환
    const workDate=work_date.toISOString().split('T')[0];
    const startTime = start_time.toISOString().split('T')[1].substring(0, 5);
    const endTime = end_time.toISOString().split('T')[1].substring(0, 5);
    //특정 가게의 평균 지표 구하기(가게 평점의 합/가게 리뷰 개수)
    const reviews = store.store_review;
    const reviewCount=reviews.length;
    const totalScore = reviewCount>0
    ?Number((reviews.reduce((acc,curr)=>acc+curr.total_score,0)/reviewCount).toFixed(1))
    :0;

    return {
        albaId,
        storeName:store.store_name,
        workDate,
        dayOfWeek:day_of_week,
        workTime:work_time,
        startTime,
        endTime,
        hourlyRate:hourly_rate, //시급
        totalWage:total_wage,  //예상급여
        storeAddress:store.store_address,
        totalScore, //신뢰지표
        mainTask:main_task,
        requirement,
        notification
    }
}   

/**
 * 대타 아르바이트 지원 기능
 * @param data(albaId,userId)
 */
export const applyAlba= async(albaId:string,userId:string) =>{
    //Id Buffer로 변환
    const userBuffer=Buffer.from(userId.replace(/-/g,""),'hex');
    const albaBuffer = Buffer.from(albaId.replace(/-/g,""),'hex');

    const result = await prisma.user_alba.create({
        data:{
            user_id:userBuffer,
            alba_id:albaBuffer,
            //승인이 아니므로 초기에는 waiting으로 설정
            process_status:'waiting',
            settlement_status:'waiting'
        }
    })
    return result
}

