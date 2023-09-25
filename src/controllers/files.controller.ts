import { Request, Response } from "express"
import { FilesService } from "../services";
import { errMsg } from "../utils";

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

export const FilesController = {
    getContent
}