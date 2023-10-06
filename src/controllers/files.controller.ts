import { Request, Response } from "express"
import { FilesService } from "../services";
import { errMsg } from "../utils";
import { ContentAction, ContentCreation, ContentMove } from "../models";

const getContent = async (req: Request, res: Response) => {
    const path = req.path;

    try {
        const uriDecodedPath = decodeURI(path);
        const content = await FilesService.getContent(uriDecodedPath);
        if (content) {
            res.status(200).json(content);

        } else {
            res.status(404).send('file not found');
        }


    } catch (error) {
        res.status(500).send(`Internal server error: ${errMsg(error)}`);
    }
}

const createContent = async (req: Request, res: Response) => {
    const path = req.path;

    try {
        const uriDecodedPath = decodeURI(path);
        
        if (FilesService.exists(uriDecodedPath)) {
            const contentCreation = req.body as ContentCreation;

            const result = await FilesService.createContent(uriDecodedPath, contentCreation);
            if (result.stats) {
                res.status(201).json(result.stats);
    
            } else {
                res.status(409).send(result.error);
            }
    
        } else {
            res.status(404).send(`Path does not exist`);
        }
 
    } catch (error) {
        res.status(500).send(`Internal server error: ${errMsg(error)}`);
    }
}

const moveContent = async (req: Request, res: Response) => {
    const path = req.path;

    try {
        const uriDecodedPath = decodeURI(path);
        
        if (FilesService.exists(uriDecodedPath)) {
            const contentMove = req.body as ContentMove;

            const result = await FilesService.moveContent(uriDecodedPath, contentMove.path);
            if (result.stats) {
                res.status(200).json(result.stats);
    
            } else {
                res.status(409).send(result.error);
            }
    
        } else {
            res.status(404).send(`Path does not exist`);
        }
 
    } catch (error) {
        res.status(500).send(`Internal server error: ${errMsg(error)}`);
    }
}

const deleteContent = async (req: Request, res: Response) => {
    const path = req.path;

    try {
        const uriDecodedPath = decodeURI(path);
        
        if (FilesService.exists(uriDecodedPath)) {
            const result = await FilesService.deleteContent(uriDecodedPath);
            if (result.success) {
                res.status(200).json({success: true});
    
            } else {
                res.status(409).send(result.error);
            }

        } else {
            res.status(404).send(`Path does not exist`);
        }

    } catch (error) {
        res.status(500).send(`Internal server error: ${errMsg(error)}`);
    }
}

const performContentAction = async (req: Request, res: Response) => {
    const path = req.path;

    try {
        const uriDecodedPath = decodeURI(path);
        
        if (FilesService.exists(uriDecodedPath)) {
            const contentAction = req.body as ContentAction;

            const result = await FilesService.performContentAction(uriDecodedPath, contentAction);
            if (result.stats) {
                res.status(200).json(result.stats);
    
            } else {
                res.status(409).send(result.error);
            }
    
        } else {
            res.status(404).send(`Path does not exist`);
        }
 
    } catch (error) {
        res.status(500).send(`Internal server error: ${errMsg(error)}`);
    }
}


export const FilesController = {
    getContent,
    createContent,
    deleteContent,
    moveContent,
    performContentAction,
}