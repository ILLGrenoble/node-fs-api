import express from 'express'
import { FilesController } from '../controllers';

export const filesRouter = express.Router();

filesRouter.get('*', FilesController.getContent);
