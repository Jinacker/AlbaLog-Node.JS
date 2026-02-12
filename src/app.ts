import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { RegisterRoutes } from './routes/tsoaRoutes';
import * as swaggerUI from 'swagger-ui-express';
import swaggerJson from './spec/swagger.json';
import errorMiddleware from './middleware/error';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { googleStrategy } from './config/auth';
import { initWorkLogScheduler } from './scheduler/work_log_scheduler';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());
passport.use(googleStrategy);

app.get(
  '/api/user/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
);

app.get(
  '/api/user/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
);

// Routes
RegisterRoutes(app);

// swagger 문서 경로
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerJson));

app.use('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);

  // 스케줄러 초기화 (퇴근 시간 자동 처리)
  initWorkLogScheduler();
});

// 에러 핸들링 미들웨어
app.use(errorMiddleware);
