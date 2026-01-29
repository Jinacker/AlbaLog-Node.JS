import { user_alba_schedule_day_of_week, user_alba_schedule_repeat_type } from '@prisma/client';

// 유저 직접입력 Body
export interface CreateManualScheduleBody {
  user_id: string;
  workplace?: string;
  work_date?: string;
  work_time?: string;
  day_of_week?: user_alba_schedule_day_of_week; // 실제 enum 타입으로 바꿔도 됨
  repeat_type?: user_alba_schedule_repeat_type; // 실제 enum 타입으로 바꿔도 됨
  repeat_days?: string;
  hourly_wage?: number;
  memo?: string;
}

// 알바 정보 기반 Body
export interface CreateFromAlbaBody {
  user_id: string;
  user_work_log_id: string; // 참조할 알바 정보의 ID
}
