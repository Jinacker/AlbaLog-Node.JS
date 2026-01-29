import jwt from 'jsonwebtoken';
import prisma from './prisma';
import uuid from 'uuid';
import { InvalidTokenError } from '../DTO/error_dto';

/**
 * jwt 토큰 발급 함수
 * @param user passport에서 전달한 유저 정보 {id: Uint8Array; email: string}
 * @returns accesstoken과 refreshtoken
 */
async function generateTokens(user: { id: Uint8Array; email: string }) {
  const unparsedId = uuid.stringify(Buffer.from(user.id));
  // 1. Access Token 생성 (짧은 유효기간)
  const accessToken = jwt.sign(
    { id: unparsedId, email: user.email },
    process.env.JWT_ACCESS_SECRET!,
    {
      expiresIn: '15m',
    },
  );

  // 2. Refresh Token 생성 (긴 유효기간)
  const refreshToken = jwt.sign({ id: unparsedId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d',
  });

  const parsedId = new Uint8Array(user.id);

  // 3. DB에 Refresh Token 저장
  await prisma.user.update({
    where: { user_id: parsedId },
    data: { refresh_token: refreshToken },
  });

  return { accessToken, refreshToken };
}

async function refreshTokens(refreshToken: string) {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);

    if (!decoded) {
      throw new InvalidTokenError();
    }

    const user = await prisma.user.findUnique({
      where: { refresh_token: refreshToken },
    });

    if (!user) {
      throw new InvalidTokenError('Invalid refresh token');
    }

    return generateTokens({ id: user.user_id, email: user.email });
  } catch (err) {
    throw new InvalidTokenError('Unknown error: refreshTokens', err);
  }
}

export { generateTokens, refreshTokens };
