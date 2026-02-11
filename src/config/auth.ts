import prisma from './prisma';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/user/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const isExist = await prisma.user.findFirst({
        where: {
          email: profile.emails[0].value,
        },
      });

      if (isExist) {
        done(null, isExist);
      } else {
        const newUser = await prisma.user.create({
          data: {
            user_name: profile.displayName,
            email: profile.emails[0].value,
            profile_image: profile.photos[0].value,
          },
        });

        done(null, newUser);
      }
    } catch (error) {
      done(error);
    }
  },
);
