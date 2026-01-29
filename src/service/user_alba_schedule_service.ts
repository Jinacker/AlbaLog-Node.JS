// src/service/user_alba_schedule.service.ts
import { CreateManualScheduleBody, CreateFromAlbaBody } from '../DTO/user_alba_schedule_dto';
import { UserAlbaScheduleRepository } from '../repository/user_alba_schedule_repository';
import { UserWorkLogRepository } from '../repository/user_work_log_repository';
import { binToUuid } from '../util/uuid';
import { CustomError } from '../DTO/error_dto';

const scheduleRepo = new UserAlbaScheduleRepository();
const workLogRepo = new UserWorkLogRepository();

function toDateString(d: Date): string {
  // DB Date -> "YYYY-MM-DD"
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toTimeRangeString(start?: Date | null, end?: Date | null): string | undefined {
  // DateTime -> "HH:MM-HH:MM"
  const fmt = (t: Date) =>
    `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
  if (!start && !end) return undefined;
  if (start && end) return `${fmt(start)}-${fmt(end)}`;
  if (start) return `${fmt(start)}-`;
  return `-${fmt(end!)}`;
}

function validateManual(body: CreateManualScheduleBody) {
  if (!body.user_id) {
    throw new CustomError('400', 400, 'user_id가 필요합니다.', null);
  }

  // 예시: repeat 모순 검증 (정책에 맞게 수정)
  if (body.repeat_type && !body.repeat_days) {
    throw new CustomError('400', 400, 'repeat_type이 있으면 repeat_days가 필요합니다.', null);
  }
  if (!body.repeat_type && body.repeat_days) {
    throw new CustomError('400', 400, 'repeat_days가 있으면 repeat_type이 필요합니다.', null);
  }
}

function validateFromAlba(body: CreateFromAlbaBody) {
  if (!body.user_id) {
    throw new CustomError('400', 400, 'user_id가 필요합니다.', null);
  }
  if (!body.user_work_log_id) {
    throw new CustomError('400', 400, 'user_work_log_id가 필요합니다.', null);
  }
}

export async function createManual(body: CreateManualScheduleBody): Promise<string> {
  validateManual(body);

  const idBin = await scheduleRepo.create({
    user_id: body.user_id,
    workplace: body.workplace,
    work_date: body.work_date,
    work_time: body.work_time,
    day_of_week: body.day_of_week,
    repeat_type: body.repeat_type,
    repeat_days: body.repeat_days,
    hourly_wage: body.hourly_wage,
    memo: body.memo,
  });

  return binToUuid(idBin);
}

export async function createFromAlba(body: CreateFromAlbaBody): Promise<string> {
  validateFromAlba(body);

  const wl = await workLogRepo.findByIdAndUser(body.user_id, body.user_work_log_id);
  if (!wl) {
    throw new CustomError('EC400', 400, '해당 근무 기록(user_work_log)을 찾을 수 없습니다.', null);
  }

  // work_log -> schedule에 매핑 (필요 최소)
  const workDateStr = wl.work_date ? toDateString(wl.work_date) : undefined;
  const workTimeStr = toTimeRangeString(wl.start_time, wl.end_time);

  const hourlyWage = wl.alba_posting?.hourly_rate ?? undefined;
  const workplace = wl.alba_posting?.store?.store_name ?? undefined;

  const idBin = await scheduleRepo.create({
    user_id: body.user_id,
    hourly_wage: hourlyWage,
    work_date: workDateStr,
    work_time: workTimeStr,
    workplace: workplace,
  });

  return binToUuid(idBin);
}
