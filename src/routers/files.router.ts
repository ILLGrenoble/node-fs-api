import express from 'express'
import { FilesController } from '../controllers';

export const filesRouter = express.Router();

// Get file or directory contents
filesRouter.get('*', FilesController.getContent);

// Upload file or create directory
filesRouter.post('*', FilesController.createContent);

// Copy file or directory
filesRouter.put('*', FilesController.getContent);

// Move file or directory
filesRouter.patch('*', FilesController.getContent);

// Delete file or directory
filesRouter.delete('*', FilesController.deleteContent);

