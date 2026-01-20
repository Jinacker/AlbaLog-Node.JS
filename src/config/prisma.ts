import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const databaseUrl = process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL 또는 LOCAL_DATABASE_URL 환경 변수가 설정되지 않았습니다.');
}

// Prisma adapter에 connection string 직접 전달
const adapter = new PrismaMariaDb(databaseUrl);

// PrismaClient 생성
const prisma = new PrismaClient({ adapter });

export default prisma;