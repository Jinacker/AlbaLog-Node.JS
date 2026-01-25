import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import { InvalidTokenError } from '../DTO/error_dto';

export function expressAuthentication(
  request: express.Request,
  securityName: string,
): Promise<any> {
  if (securityName === 'jwt') {
    if (!request.headers['authorization']) {
      return Promise.reject(new InvalidTokenError('No token provided'));
    }

    const token = request.headers['authorization'].split(' ')[1];

    return new Promise((resolve, reject) => {
      if (!token) {
        reject(new InvalidTokenError('No token provided'));
      }

      jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
  }
}
