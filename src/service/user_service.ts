import { InvalidTokenError } from '../DTO/error_dto';
import { refreshTokens } from '../config/jwt';

class UserService {
  static async refreshAccessTokenService(refreshToken?: string) {
    if (!refreshToken) {
      throw new InvalidTokenError('No refresh token provided');
    }

    const { accessToken } = await refreshTokens(refreshToken);

    return accessToken;
  }
}

export default UserService;
