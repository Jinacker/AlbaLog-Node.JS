// src/service/user_alba_schedule.service.ts
import {
  CreateManualScheduleBody,
  CreateFromAlbaBody,
  UpdateManualScheduleBody,
} from '../DTO/user_alba_schedule_dto';
import { UserAlbaScheduleRepository } from '../repository/user_alba_schedule_repository';
import { UserWorkLogRepository } from '../repository/user_work_log_repository';
import { binToUuid } from '../util/uuid';
import { CustomError } from '../DTO/error_dto';

const scheduleRepo = new UserAlbaScheduleRepository();
const workLogRepo = new UserWorkLogRepository();

type RepeatBody = Pick<CreateManualScheduleBody, 'repeat_type' | 'repeat_days'>;

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

const MASK7 = /^[01]{7}$/;

function validateManual(body: RepeatBody) {
  const rt = body.repeat_type;
  const rd = body.repeat_days;

  // 반복 설정 자체가 없으면 단발 일정
  if (!rt) {
    if (rd) {
      throw new CustomError('400', 400, 'repeat_type 없이 repeat_days를 보낼 수 없습니다.', null);
    }
    return;
  }

  // none/daily는 repeat_days 금지
  if (rt === 'none' || rt === 'daily') {
    if (rd) {
      throw new CustomError('400', 400, `${rt}이면 repeat_days는 필요하지 않습니다.`, null);
    }
    return;
  }

  // weekly/biweekly는 repeat_days 필수
  if (!rd) {
    throw new CustomError('400', 400, `${rt}이면 repeat_days가 필요합니다.`, null);
  }

  // DB 저장 안정성 + 규격 강제 (VARCHAR(10) 안에서 안전)
  if (rd.length > 10) {
    throw new CustomError(
      '400',
      400,
      'repeat_days가 너무 깁니다. 7자리 비트마스크만 허용합니다.',
      null,
    );
  }
  if (!MASK7.test(rd)) {
    throw new CustomError(
      '400',
      400,
      'repeat_days는 7자리 비트마스크(예: 1010100)여야 합니다.',
      null,
    );
  }
  if (!rd.includes('1')) {
    throw new CustomError(
      '400',
      400,
      'repeat_days에는 최소 1개 이상의 요일이 포함되어야 합니다.',
      null,
    );
  }
}

function validateFromAlba(body: CreateFromAlbaBody) {
  if (!body.user_work_log_id) {
    throw new CustomError('400', 400, 'user_work_log_id가 필요합니다.', null);
  }
}

/**
 * work_time("09:00-18:00")과 work_date("2026-02-10")를 파싱하여
 * user_work_log에 필요한 Date 객체를 생성
 */
function parseScheduleToWorkLogData(workDate?: string, workTime?: string) {
  if (!workDate) return null;

  // work_date는 Date 타입이므로 UTC midnight으로 저장하여 날짜가 밀리지 않도록 처리
  const date = new Date(workDate + 'T00:00:00Z');

  let startTime: Date | null = null;
  let endTime: Date | null = null;
  let workMinutes: number | null = null;

  if (workTime) {
    const [startStr, endStr] = workTime.split('-');
    if (startStr) {
      const [sh, sm] = startStr.split(':').map(Number);
      startTime = new Date(
        workDate + `T${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}:00+09:00`,
      );
    }
    if (endStr) {
      const [eh, em] = endStr.split(':').map(Number);
      endTime = new Date(
        workDate + `T${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}:00+09:00`,
      );
      // 야간 근무 (종료 시간이 시작 시간보다 이전)
      if (endTime <= startTime!) {
        endTime.setDate(endTime.getDate() + 1);
      }
    }
    if (startTime && endTime) {
      workMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
    }
  }

  return { workDate: date, startTime, endTime, workMinutes };
}

// 유저 수동 입력 스케줄 생성
export async function createManual(
  userId: string,
  body: CreateManualScheduleBody,
): Promise<string> {
  validateManual(body);

  const scheduleInput = {
    workplace: body.workplace,
    work_date: body.work_date,
    work_time: body.work_time,
    day_of_week: body.day_of_week,
    repeat_type: body.repeat_type,
    repeat_days: body.repeat_days,
    hourly_wage: body.hourly_wage,
    memo: body.memo,
  };

  // work_date가 있으면 work_log도 함께 생성 (홈 리스트 노출용)
  const workLogData = parseScheduleToWorkLogData(body.work_date, body.work_time);

  let idBin: Uint8Array;
  if (workLogData) {
    idBin = await scheduleRepo.createWithWorkLog(userId, scheduleInput, workLogData);
  } else {
    idBin = await scheduleRepo.create(userId, scheduleInput);
  }

  return binToUuid(idBin);
}

// 유저 알바 정보 기반 스케줄 생성
export async function createFromAlba(userId: string, body: CreateFromAlbaBody): Promise<string> {
  validateFromAlba(body);

  const wl = await workLogRepo.findByIdAndUser(userId, body.user_work_log_id);
  if (!wl) {
    throw new CustomError('EC400', 400, '해당 근무 기록(user_work_log)을 찾을 수 없습니다.', null);
  }

  // work_log -> schedule에 매핑 (필요 최소)
  const workDateStr = wl.work_date ? toDateString(wl.work_date) : undefined;
  const workTimeStr = toTimeRangeString(wl.start_time, wl.end_time);

  const hourlyWage = wl.alba_posting?.hourly_rate ?? undefined;
  const workplace = wl.alba_posting?.store?.store_name ?? undefined;

  const idBin = await scheduleRepo.create(userId, {
    hourly_wage: hourlyWage,
    work_date: workDateStr,
    work_time: workTimeStr,
    workplace,
  });

  return binToUuid(idBin);
}

export async function update(
  userId: string,
  scheduleId: string,
  body: UpdateManualScheduleBody,
): Promise<void> {
  const hasAnyField = Object.values(body).some((v) => v !== undefined);
  if (!hasAnyField) {
    throw new CustomError('EC400', 400, '수정할 값이 없습니다.', null);
  }

  // 반복 관련 필드가 들어오면 기존 값과 합쳐서 검증
  if (body.repeat_type !== undefined || body.repeat_days !== undefined) {
    const existing = await scheduleRepo.findByIdAndUserId(userId, scheduleId);
    if (!existing) {
      throw new CustomError('EC404', 404, '스케줄을 찾을 수 없습니다.', null);
    }

    const nextRepeatType = body.repeat_type !== undefined ? body.repeat_type : existing.repeat_type;

    const nextRepeatDays = body.repeat_days !== undefined ? body.repeat_days : existing.repeat_days;

    // daily/none으로 바꾸면 repeat_days는 최종적으로 null로 간주
    const normalizedRepeatDays =
      nextRepeatType === 'daily' || nextRepeatType === 'none' ? null : nextRepeatDays;

    // 최종값 계산
    const merged: RepeatBody = {
      repeat_type: nextRepeatType,
      repeat_days: normalizedRepeatDays,
    };

    validateManual(merged);
  }

  const updateData: any = { ...body };
  if (body.repeat_type === 'daily' || body.repeat_type === 'none') {
    updateData.repeat_days = null; // 선택
  }

  const updatedCount = await scheduleRepo.updateByIdAndUserId(userId, scheduleId, updateData);

  if (updatedCount === 0) {
    throw new CustomError('EC404', 404, '스케줄을 찾을 수 없습니다.', null);
  }
}

export async function remove(userId: string, scheduleId: string): Promise<void> {
  const deletedCount = await scheduleRepo.deleteByIdAndUserId(userId, scheduleId);

  if (deletedCount === 0) {
    throw new CustomError('EC404', 404, '스케줄을 찾을 수 없습니다.', null);
  }
}
