import { user_alba_process_status, user_alba_settlement_status } from "@prisma/client"

export interface AlbaDetailResponseDto{
    albaId:string,
    storeName: string,
    workDate: string,
    dayOfWeek:string,
    workTime:number,
    startTime:string,
    endTime:string,
    hourlyRate:number, //시급
    totalWage:number,  //예상급여
    storeAddress:string,
    totalScore:number, //신뢰지표
    mainTask:string,
    requirement:string,
    notification:string
}

export interface AlbaApplyRequestDto{
    albaId:string,
    userId:string
}
export interface AlbaApplyResponseDto{
    albaId:string,
    userId:string,
    processStatus:user_alba_process_status,
    settlementStatus:user_alba_settlement_status
}