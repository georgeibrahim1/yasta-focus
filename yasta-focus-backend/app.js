import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import AppError from './utils/appError.js';
import errorController from './controllers/errorController.js';
import authRouter from './routes/authRouter.js';
import subjectRouter from './routes/subjectRouter.js';
import noteRouter from './routes/noteRouter.js';
import taskRouter from './routes/taskRouter.js';
import sessionRouter from './routes/sessionRouter.js';
import deckRouter from './routes/deckRouter.js';
import flashcardRouter from './routes/flashcardRouter.js';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/subjects', subjectRouter);
app.use('/api/notes', noteRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/decks', deckRouter);
app.use('/api/flashcards', flashcardRouter);

app.use((req, res, next) => {
  next(new AppError(`${req.originalUrl} isn't in the server!`, 404));
});

app.use(errorController);

export default app;