import express from 'express'
import { authTokenMiddleware } from '../middlewares';
import { filesRouter } from './files.router';

export const apiRouter = express.Router();

apiRouter.use(authTokenMiddleware);
apiRouter.use('/files', filesRouter);

