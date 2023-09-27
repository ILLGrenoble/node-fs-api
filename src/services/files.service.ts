import { ContentCreation, CreationResult, DirectoryContent, FileContent, FileStats } from "../models"
import { stat, readFile, access, constants, readdir, mkdir, rm, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { basename, extname } from 'path';
import { isBinaryFile} from 'isbinaryfile';
import mime from 'mime-types';
import { errMsg, logger } from "../utils";
import { DeletionResult } from "../models/deletion-result.model";

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
        if (!exists(path)) {
            return null;
        }
        const fullPath = `${process.env.HOME}${path}`;

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

const exists = (path: string): boolean => {
    const fullPath = `${process.env.HOME}${path}`;

    const exists = existsSync(fullPath);

    return exists;
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

const createContent = async (path: string, data: ContentCreation): Promise<CreationResult> => {
    try {
        const parentPath = `${process.env.HOME}${path}`;
        const contentPath = `${path}/${data.name}`;
        const contentFullPath = `${parentPath}/${data.name}`;

        const stats = await getStats(contentPath);
        if (stats && stats.type === 'directory') {
            return { error: 'Cannot overwrite an existing directory' };
        
        } else if (stats && !stats.writeable) {
            return { error: 'Do not have write permission for the file' };
        }

        // Get parent path
        const parentPathWriteable = await writeable(parentPath);
        if (parentPathWriteable) {
            if (data.type === 'directory') {
                await mkdir(contentFullPath);

            } else if (data.type === 'file') {
                const buffer = Buffer.from(data.content, data.format);
                await writeFile(contentFullPath, buffer);
            }

            const stats = await getStats(contentPath);
    
            return { stats };
    
        } else {
            return { error: 'Parent directory is not writeable' };
        }


    } catch (error) {
        logger.error(`Failed to create content: ${errMsg(error)}`);
        throw error;
    }
}

const deleteContent = async (path: string): Promise<DeletionResult> => {
    try {
        const fullPath = `${process.env.HOME}${path}`;

        if (exists(path)) {
            const stats = await getStats(path);
            if (stats.type === 'directory') {
                await rm(fullPath, {recursive: true, force: true});

            } else if (stats.type === 'file') {
                await rm(fullPath);
            }

            return {success: true};

        } else {
            return {success: false, error: 'path does not exists' };
        }

    } catch (error) {
        logger.error(`Failed to delete content: ${errMsg(error)}`);
        throw error;
    }
}

export const FilesService = {
    exists,
    getContent,
    createContent,
    deleteContent,
}