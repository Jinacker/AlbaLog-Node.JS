export interface SearchAlbaRequestDto{
    //Todo:거리 기준 필터링 추가
    workDate?:string,
    storeCategory?:string,
    storeName?:string,
    workTime?:string,
    hourlyRate?:number
}
export interface SearchAlbaResponseDto{
    albaId:string,
    storeId:string,
    storeName:string,
    startTime:Date,
    endTime:Date,
    dayOfWeek:string,
    hourlyRate:number
    //Todo: 위치 기반 거리 계산, 가게 카테고리 반영
}