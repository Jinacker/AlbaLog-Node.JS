// src/repositories/settlement_status_list.repository.ts
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { SettlementListResponseDTO } from '../DTO/settlement_status_list_dto';
import { uuidToBin, binToUuid } from '../util/uuid';

// 너희 enum/string 타입에 맞춰서 import 경로만 맞추면 됨
import {
  SettlementStatusQuery,
  SettlementSortQuery,
} from '../controller/settlement_status_list_controller';

// const prisma = new PrismaClient();

type SettlementStatusDb = Exclude<SettlementStatusQuery, 'all'>; // 'waiting' | 'paid' | 'unpaid'

interface FindMySettlementsParams {
  userId: string; // uuid string
  settlementStatus?: SettlementStatusDb; // undefined면 전체
  sort: SettlementSortQuery; // 'latest' | 'oldest'
  cursor?: string; // uuid string (user_work_log_id)
  size: number; // page size
}

export class SettlementStatusListRepository {
  public async findMySettlements(
    params: FindMySettlementsParams,
  ): Promise<SettlementListResponseDTO & { nextCursor?: string }> {
    const { userId, settlementStatus, sort, cursor, size } = params;

    const userIdBin = uuidToBin(userId);

    // 정렬
    const orderBy: Prisma.user_work_logOrderByWithRelationInput[] = [
      { work_date: sort === 'latest' ? 'desc' : 'asc' },
      { user_work_log_id: sort === 'latest' ? 'desc' : 'asc' }, // 동률 대비
    ];

    // where: 내 근무기록
    const where: Prisma.user_work_logWhereInput = {
      user_id: userIdBin,
      ...(settlementStatus
        ? {
            // user_work_log -> alba_posting -> user_alba (복합 PK) 기준으로 상태 필터
            alba_posting: {
              user_alba: {
                some: {
                  user_id: userIdBin,
                  settlement_status: settlementStatus,
                },
              },
            },
          }
        : {}),
    };

    const take = Math.min(Math.max(size, 1), 20); // 안전장치

    const cursorOpt: Prisma.user_work_logFindManyArgs['cursor'] | undefined = cursor
      ? { user_work_log_id: uuidToBin(cursor) }
      : undefined;

    const logs = await prisma.user_work_log.findMany({
      where,
      orderBy,
      take: take + 1, // 다음 페이지 존재 여부 확인용
      ...(cursorOpt ? { cursor: cursorOpt, skip: 1 } : {}),
      include: {
        income_log: { select: { amount: true } },
        alba_posting: {
          select: {
            hourly_rate: true,
            store: { select: { store_name: true } },
            user_alba: {
              where: { user_id: userIdBin },
              select: { settlement_status: true },
            },
          },
        },
      },
    });

    const hasNext = logs.length > take;
    const pageLogs = hasNext ? logs.slice(0, take) : logs;

    const items = pageLogs.map((log) => {
      const storeName = log.alba_posting?.store?.store_name ?? '';
      const workMinutes = log.work_minutes ?? 0;

      const hourlyRate = log.alba_posting?.hourly_rate ?? 0;
      // work_minutes*hourly_rate/60
      const expectedIncome = Math.floor((hourlyRate * workMinutes) / 60);

      // income_log가 여러개면 합산 (보너스 등)
      const amount = (log.income_log ?? []).reduce((sum, x) => sum + (x.amount ?? 0), 0);

      const settlementStatus =
        (log.alba_posting?.user_alba?.[0]?.settlement_status as SettlementStatusDb | undefined) ??
        'unpaid';

      return {
        work_date: log.work_date ? log.work_date.toISOString().slice(0, 10) : null,
        store_name: storeName,
        work_minutes: workMinutes,
        expected_income: expectedIncome,
        amount,
        settlement_status: settlementStatus,
        // 프론트가 다음 페이지 요청할 수 있게 id도 넘겨줌
        user_work_log_id: binToUuid(log.user_work_log_id as unknown as Buffer),
      };
    });

    const nextCursor = hasNext
      ? binToUuid(pageLogs[pageLogs.length - 1].user_work_log_id as unknown as Buffer)
      : undefined;

    return {
      items,
      hasNext,
      ...(nextCursor ? { nextCursor } : {}),
    };
  }
}

export const settlementStatusListRepository = new SettlementStatusListRepository();
