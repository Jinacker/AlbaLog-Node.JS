import { InvalidTokenError, UserRegionError } from '../DTO/error_dto';
import { ResponseFromInitialRegion, ResponseFromUser, UserRegisterParams } from '../DTO/userDTO';
import { refreshTokens } from '../config/jwt';
import UserRepository from '../repository/user_repository';
import { uuidToBin } from '../util/uuid';

class UserService {
  static async refreshAccessTokenService(refreshToken?: string) {
    if (!refreshToken) {
      throw new InvalidTokenError('No refresh token provided');
    }

    const { accessToken } = await refreshTokens(refreshToken);

    return accessToken;
  }

  /**
   * 유저 상세 정보 등록 (회원가입)
   * @param userId - 유저 ID (Buffer)
   * @param userInfo - 유저 등록 정보 (닉네임, 생년월일, 성별)
   * @returns 업데이트된 유저 정보
   */
  static async registerUser(
    userId: string,
    userInfo: UserRegisterParams,
  ): Promise<ResponseFromUser> {
    const parsedId = uuidToBin(userId);
    const updatedUser = await UserRepository.updateUser(parsedId, {
      user_name: userInfo.nickname,
      user_birth: userInfo.birthdate,
      gender: userInfo.gender,
    });

    const { user_name, user_birth, gender } = updatedUser;

    return new ResponseFromUser(parsedId, {
      user_name,
      user_birth,
      gender,
    });
  }

  /**
   * 유저 첫 로그인 시 지역 선택 함수
   */
  static async setUserRegion(userId: string, regionCode: number[]) {
    const parsedId = uuidToBin(userId);

    const result = await UserRepository.setUserRegion(parsedId, regionCode);

    if (result == null) {
      throw new UserRegionError('이미 지역이 존재하는 유저입니다.');
    }

    return new ResponseFromInitialRegion(result);
  }
}

export default UserService;
