// src/repository/user_alba_schedule_repository.ts
import { user_alba_schedule_day_of_week, user_alba_schedule_repeat_type } from '@prisma/client';
import prisma from '../config/prisma';
import { UpdateManualScheduleBody } from '../DTO/user_alba_schedule_dto';

import { uuidToBin } from '../util/uuid';

export interface CreateUserAlbaScheduleRepoInput {
  workplace?: string;
  work_date?: string;
  work_time?: string;
  workplace_name?: string;
  workplace_color?: string;

  day_of_week?: user_alba_schedule_day_of_week;
  repeat_type?: user_alba_schedule_repeat_type;
  repeat_days?: string;

  hourly_wage?: number;
  memo?: string;
}

export class UserAlbaScheduleRepository {

    async listByUserId(userId: string, opts: { month?: string }) {
    const userIdBin = uuidToBin(userId);

    return prisma.user_alba_schedule.findMany({
      where: {
        user_id: userIdBin,
        ...(opts.month
          ? {
              // work_date가 "YYYY-MM-DD" 문자열로 저장된 전제
              work_date: { startsWith: opts.month },
            }
          : {}),
      },
      orderBy: [
        { work_date: 'asc' }, // null이면 뒤로 가거나 앞에 올 수 있음(필요하면 null 필터)
        { work_time: 'asc' },
      ],
    });
  }

    async findDetailByIdAndUserId(userId: string, scheduleId: string) {
    const userIdBin = uuidToBin(userId);
    const scheduleIdBin = uuidToBin(scheduleId);

    return prisma.user_alba_schedule.findFirst({
      where: {
        user_id: userIdBin,
        user_alba_schedule_id: scheduleIdBin,
      },
      select: {
        user_alba_schedule_id: true,
        workplace: true,
        workplace_name: true,
        workplace_color: true,
        work_date: true,
        work_time: true,
        day_of_week: true,
        repeat_type: true,
        repeat_days: true,
        hourly_wage: true,
        memo: true,
      },
    });
  }
  public async create(userId: string, input: CreateUserAlbaScheduleRepoInput): Promise<Uint8Array> {
    const created = await prisma.user_alba_schedule.create({
      data: {
        user_id: uuidToBin(userId),

        workplace: input.workplace ?? null,
        workplace_name: input.workplace_name ?? null, 
        workplace_color: input.workplace_color ?? null,
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

  /**
   * 스케줄 생성 + work_log 동시 생성 (트랜잭션)
   * 수동 일정 생성 시 홈 리스트에 노출되도록 user_work_log도 함께 생성
   */
  public async createWithWorkLog(
    userId: string,
    input: CreateUserAlbaScheduleRepoInput,
    workLogData: {
      workDate: Date;
      startTime: Date | null;
      endTime: Date | null;
      workMinutes: number | null;
    },
  ): Promise<Uint8Array> {
    const userIdBin = uuidToBin(userId);

    const schedule = await prisma.$transaction(async (tx) => {
      // 1. 일정 생성
      const created = await tx.user_alba_schedule.create({
        data: {
          user_id: userIdBin,
          workplace: input.workplace ?? null,
          workplace_name: input.workplace_name ?? null,
          workplace_color: input.workplace_color ?? null,
          work_date: input.work_date ?? null,
          work_time: input.work_time ?? null,
          day_of_week: input.day_of_week ?? null,
          repeat_type: input.repeat_type ?? null,
          repeat_days: input.repeat_days ?? null,
          hourly_wage: input.hourly_wage ?? null,
          memo: input.memo ?? null,
        },
        select: { user_alba_schedule_id: true },
      });

      // 2. work_log 생성 (schedule_id 연결)
      await tx.user_work_log.create({
        data: {
          user_id: userIdBin,
          user_alba_schedule_id: created.user_alba_schedule_id,
          work_date: workLogData.workDate,
          start_time: workLogData.startTime,
          end_time: workLogData.endTime,
          work_minutes: workLogData.workMinutes,
          status: 'scheduled',
        },
      });

      return created;
    });

    return schedule.user_alba_schedule_id;
  }

  public async findByIdAndUserId(userId: string, scheduleId: string) {
    const userIdBin = uuidToBin(userId);
    const scheduleIdBin = uuidToBin(scheduleId);

    return prisma.user_alba_schedule.findFirst({
      where: {
        user_id: userIdBin,
        user_alba_schedule_id: scheduleIdBin,
      },
      select: {
        repeat_type: true,
        repeat_days: true,
        // merge 검증에 필요하면 더 추가 가능
      },
    });
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
        workplace_name: body.workplace_name, // ✅ [CHANGED]
        workplace_color: body.workplace_color,
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
