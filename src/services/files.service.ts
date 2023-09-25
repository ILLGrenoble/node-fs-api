import { DirectoryContent, FileContent, FileStats } from "../models"
import { stat, readFile, access, constants, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { basename, extname } from 'path';
import { isBinaryFile} from 'isbinaryfile';
import mime from 'mime-types';
import { errMsg, logger } from "../utils";

const writeable = async (fullpath: string): Promise<boolean> => {
    try {
        await access(fullpath, constants.W_OK);
        return true;

    } catch (error) {
        return false;
    }
}

const mimetype = (path: string, isBinary: boolean): string => {
    const mimetype = mime.lookup(extname(path));
    if (mimetype !== false) {
        return mimetype;
    
    } else if (isBinary) {
        return 'application/octet-stream';

    } else {
        return 'text/plain';
    }
}


const getStats = async (path: string): Promise<FileStats> => {
    try {
        const fullPath = `${process.env.HOME}${path}`;

        const exists = existsSync(fullPath);
        if (!exists) {
            return null;
        }

        const stats = await stat(fullPath);
        const is_writeable = await writeable(fullPath);

        let type = null;
        if (stats.isDirectory()) {
            type = 'directory';

        } else if (stats.isFile()) {
            type = 'file';
        }

        return {
            path,
            type,
            created: stats.birthtime,
            last_modified: stats.mtime,
            size: stats.size,
            name: basename(path),
            writeable: is_writeable,
        };

    } catch (error) {
        logger.error(`Failed to get stats: ${errMsg(error)}`);
        throw error;
    }
}

const getContent = async (path: string): Promise<FileContent | DirectoryContent> => {
    try {
        const fullPath = `${process.env.HOME}${path}`;

        const stats = await getStats(path);
        if (stats) {
            if (stats.type === 'directory') {
                const files = await readdir(fullPath);
                const contents: FileStats[] = [];
                for (const file of files) {
                    const filePath = `${path}/${file}`;
                    const fileStats = await getStats(filePath);
                    contents.push(fileStats);
                }

                return {
                    stats,
                    content: contents
                }

            } else if (stats.type === 'file') {
                const data = await readFile(fullPath);
                const isBinary = await isBinaryFile(data, stats.size);

                return {
                    stats,
                    content: isBinary ? data.toString('base64') : data.toString('utf-8'),
                    format: isBinary ? 'base64' : 'utf-8',
                    mimetype: mimetype(path, isBinary),
                }
            }
        }

    } catch (error) {
        logger.error(`Failed to get content: ${errMsg(error)}`);
        throw error;
    }
}

export const FilesService = {
    getContent
}