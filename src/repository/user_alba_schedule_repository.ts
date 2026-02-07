// src/repository/user_alba_schedule_repository.ts
import { user_alba_schedule_day_of_week, user_alba_schedule_repeat_type } from '@prisma/client';
import prisma from '../config/prisma';
import { UpdateManualScheduleBody } from '../DTO/user_alba_schedule_dto';

import { uuidToBin } from '../util/uuid';

export interface CreateUserAlbaScheduleRepoInput {
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
  public async create(userId: string, input: CreateUserAlbaScheduleRepoInput): Promise<Uint8Array> {
    const created = await prisma.user_alba_schedule.create({
      data: {
        user_id: uuidToBin(userId),

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

  public async updateByIdAndUserId(
    userId: string,
    scheduleId: string,
    body: UpdateManualScheduleBody,
  ): Promise<number> {
    const res = await prisma.user_alba_schedule.updateMany({
      where: {
        user_alba_schedule_id: uuidToBin(scheduleId),
        user_id: uuidToBin(userId),
      },
      data: {
        workplace: body.workplace,
        work_date: body.work_date,
        work_time: body.work_time,

        day_of_week: body.day_of_week,
        repeat_type: body.repeat_type,
        repeat_days: body.repeat_days,

        hourly_wage: body.hourly_wage,
        memo: body.memo,
      },
    });

    return res.count; // 0이면 조건에 맞는 row 없음 (= 내 것이 아니거나 존재 X)
  }

  public async deleteByIdAndUserId(userId: string, scheduleId: string): Promise<number> {
    const res = await prisma.user_alba_schedule.deleteMany({
      where: {
        user_alba_schedule_id: uuidToBin(scheduleId),
        user_id: uuidToBin(userId),
      },
    });

    return res.count;
  }
}
