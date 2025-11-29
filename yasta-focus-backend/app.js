import express from 'express';
import cors from 'cors';
import AppError from './utils/appError.js';
import errorController from './controllers/errorController.js';
import authRouter from './routes/authRouter.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`${req.originalUrl} isn't in the server!`, 404));
});

app.use(errorController);

export default app;