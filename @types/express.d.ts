import { user } from '../node_modules/.prisma/client';

declare global {
  namespace Express {
    /**
     * express Request에 user 정보 추가
     * user는 prisma에서 생성된 스키마 기반
     */
    interface Request {
      user?: user;
    }
  }
}
