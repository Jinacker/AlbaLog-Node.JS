import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { RegisterRoutes } from './routes/tsoaRoutes';
import * as swaggerUI from 'swagger-ui-express';
import swaggerJson from './spec/swagger.json';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
RegisterRoutes(app);

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerJson));

app.use('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
