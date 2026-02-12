import prisma from "../config/prisma";
import { SearchAlbaRequestDto, SearchAlbaResponseDto } from "../DTO/search_alba_dto";
import { bufferToUuid } from "../util/uuid_util";
//id값으로 변경된 storeCategoryId 사용
export interface SearchAlbaRepoParams extends SearchAlbaRequestDto{
    storeCategoryId?:number
}
/**
 * 아르바이트 필터 명시 및 조회
 * @param data 
 * @returns 조건에 맞는 알바 리스트
 */
export const findPostingByFilter = async(data:SearchAlbaRepoParams):Promise<SearchAlbaResponseDto[]>=>{
    const {workDate,storeCategoryId,storeName,hourlyRate,} = data
    const result = await prisma.alba_posting.findMany({
        where:{
            ...(hourlyRate&&{hourly_rate:{gte:hourlyRate}}),
            store:{
                ...(storeCategoryId&&{
                        store_category:{
                            some:{
                                category_id:storeCategoryId
                            }
            }}),
                ...(storeName&&{store_name:{contains:storeName}})
            },
            work_schedule:{
                ...(workDate&&{work_date:new Date(workDate)})
            }
        },
        include:{
            store:{include:{
                store_category:true
            }
            },
            work_schedule:true
        },
        orderBy:{
            store:{
                store_name:'asc'
            }
        }
    })
    //const {albaId,storeId,storeName,startTime,endTime,dayOfWeek,hourlyRate} = result
    return Promise.all(result.map(async({alba_id,store_id,store,work_schedule,hourly_rate})=>{
    // 1. 해당 store의 첫 번째 category_id 추출
    const categoryId = store.store_category[0]?.category_id;

    // 2. ID가 있다면 이름으로 변환 (아까 만든 함수 활용)
    const categoryName = categoryId 
        ? await findCategoryNameById(categoryId) 
        : "카테고리 없음";

    return{
    albaId:bufferToUuid(alba_id),
    storeId:bufferToUuid(store_id),
    storeName:store.store_name,
    storeAddress:store.store_address,
    categoryId:categoryId||0,//카테고리 없을 시 Id는 0
    storeCategory:categoryName,
    startTime:work_schedule?.start_time||new Date(),
    endTime:work_schedule?.end_time||new Date(),
    dayOfWeek:work_schedule?.day_of_week||"",
    hourlyRate:hourly_rate
    };
    }))
}

/**
 * string으로 받은 카테고리를 Id값으로 변경
 * @param category (string)
 * @returns categoryId(int)
 */
export const findCategoryById=async(category:string):Promise<number|null>=>{
    const result = await prisma.category.findFirst({
        where:{category_name:category},
        select:{category_id:true}
    })
    return result?.category_id||null;
}
/**
 * categoryId(int)를 받아 해당 카테고리의 이름을 반환
 * @param categoryId (number)
 * @returns categoryName (string | null)
 */
export const findCategoryNameById = async (categoryId: number): Promise<string | null> => {
    const result = await prisma.category.findUnique({
        where: { category_id: categoryId },
        select: { category_name: true }
    });
    
    return result?.category_name?.trim() || null;
}