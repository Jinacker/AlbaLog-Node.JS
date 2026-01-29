// src/repository/user_alba_schedule_repository.ts
import { user_alba_schedule_day_of_week, user_alba_schedule_repeat_type } from '@prisma/client';
import prisma from '../config/prisma';
import { uuidToBin } from '../util/uuid';

export interface CreateUserAlbaScheduleRepoInput {
  user_id: string; // UUID string (service에서 받음)

  workplace?: string;
  work_date?: string;
  work_time?: string;

  day_of_week?: user_alba_schedule_day_of_week;
  repeat_type?: user_alba_schedule_repeat_type;
  repeat_days?: string;

  hourly_wage?: number;
  memo?: string;
}

export class UserAlbaScheduleRepository {
  public async create(input: CreateUserAlbaScheduleRepoInput): Promise<Uint8Array> {
    const created = await prisma.user_alba_schedule.create({
      data: {
        user_id: uuidToBin(input.user_id),

        workplace: input.workplace ?? null,
        work_date: input.work_date ?? null,
        work_time: input.work_time ?? null,

        day_of_week: input.day_of_week ?? null,
        repeat_type: input.repeat_type ?? null,
        repeat_days: input.repeat_days ?? null,

        hourly_wage: input.hourly_wage ?? null,
        memo: input.memo ?? null,
      },
      select: {
        user_alba_schedule_id: true,
      },
    });

    // Prisma Bytes → Uint8Array
    return created.user_alba_schedule_id;
  }
}
