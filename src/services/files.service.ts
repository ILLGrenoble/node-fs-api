import { ActionResult, ContentAction, ContentCreation, CreationResult, DirectoryContent, FileContent, FileStats, MoveResult } from "../models"
import { stat, readFile, access, constants, readdir, mkdir, rm, writeFile, appendFile, copyFile, rename } from 'fs/promises';
import { existsSync } from 'fs';
import { basename, extname, dirname } from 'path';
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
                if (!path.endsWith('/')) {
                    path = `${path}/`;
                }
                const files = await readdir(fullPath);
                if (path !== '/') {
                    files.push('..');
                }
                const contents: FileStats[] = [];
                for (const file of files) {
                    const filePath = `${path}${file}`;
                    const fileStats = await getStats(filePath);

                    if (fileStats != null) {
                        if (file === '..') {
                            fileStats.path = `${fileStats.path.split('/').slice(0, -2).join('/')}`;
                        }

                        contents.push(fileStats);
                    }
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
                if (data.chunk == null || data.chunk === 1) {
                    await writeFile(contentFullPath, buffer);
                
                } else if (stats) {
                    await appendFile(contentFullPath, buffer);
                
                } else {
                    return { error: 'Received chunk for file that does not exist' };
                }
            }

            const createdStats = await getStats(contentPath);
            return { stats: createdStats };
    
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

const moveContent = async (sourcePath: string, destinationPath: string): Promise<MoveResult> => {
    if (!destinationPath.startsWith('/')) {
        destinationPath = `/${destinationPath}`;
    }

    const fullSourcePath = `${process.env.HOME}${sourcePath}`;
    const fullDestinationPath = `${process.env.HOME}${destinationPath}`;
    const destinationStats = await getStats(destinationPath);

    if (destinationStats) {
        return { error: 'Destination path already exists' };
    }

    const destinationFolder = dirname(destinationPath);
    if (!exists(destinationFolder)) {
        return { error: 'Destination folder does not exist' };
    }

    try {
        await rename(fullSourcePath, fullDestinationPath)

        const moveStats = await getStats(destinationPath);
        return { stats: moveStats }

    } catch (error) {
        logger.error(`Failed to move content: ${errMsg(error)}`);
        throw error;
    }
}

const performContentAction = async (path: string, action: ContentAction): Promise<ActionResult> => {
    try {
        if (exists(path)) {
            if (action.action === 'COPY_TO') {
                return performCopyToAction(path, action.path);

            } else if (action.action === 'NEW_FOLDER') {
                return performNewFolderAction(path);

            } else if (action.action === 'NEW_FILE') {
                return performNewFileAction(path);
            }

            return {error: `Unknown content action ${action.action}`};

        } else {
            return {error: 'path does not exists' };
        }

    } catch (error) {
        logger.error(`Failed to delete content: ${errMsg(error)}`);
        throw error;
    }
}

const performCopyToAction = async (sourcePath: string, destinationPath: string): Promise<ActionResult> => {
    if (!destinationPath.startsWith('/')) {
        destinationPath = `/${destinationPath}`;
    }

    const fullSourcePath = `${process.env.HOME}${sourcePath}`;
    const fullDestinationPath = `${process.env.HOME}${destinationPath}`;
    const sourceStats = await getStats(sourcePath);
    const destinationStats = await getStats(destinationPath);

    if (sourceStats.type === 'directory') {
        return { error: 'Cannot copy a directory' };

    } else if (destinationStats && destinationStats.type === 'directory') {
        return { error: 'Cannot overwrite an existing directory' };
        
    } else if (destinationStats && !destinationStats.writeable) {
        return { error: 'Do not have write permission for the file' };
    }

    try {
        await copyFile(fullSourcePath, fullDestinationPath)

        const copyStats = await getStats(destinationPath);
        return { stats: copyStats }

    } catch (error) {
        logger.error(`Failed to copy file: ${errMsg(error)}`);
        throw error;
    }
}

const performNewFolderAction = async (path: string): Promise<ActionResult> => {
    if (!path.endsWith('/')) {
        path = `${path}/`;
    }
    const fullPath = `${process.env.HOME}${path}`;
    const stats = await getStats(path);
    if (stats.type !== 'directory') {
        return { error: `Path must be a directory`};
    }

    // Get next new folder name
    const folderNamePrefix = 'Untitled Folder'
    let folderNameIndex = 0;

    let folderExists = true;
    let folderPath = '';
    let fullFolderPath = '';
    do {
        const folderName = folderNameIndex === 0 ? folderNamePrefix : `${folderNamePrefix} ${folderNameIndex}`;
        folderPath = `${path}${folderName}`;
        fullFolderPath = `${fullPath}${folderName}`;
        folderExists = exists(folderPath);
        folderNameIndex++;

    } while (folderExists);

    try {
        await mkdir(fullFolderPath);

        const newFolderStats = await getStats(folderPath);
        return { stats: newFolderStats }

    } catch (error) {
        logger.error(`Failed to create new folder: ${errMsg(error)}`);
        throw error;
    }
}

const performNewFileAction = async (path: string): Promise<ActionResult> => {
    if (!path.endsWith('/')) {
        path = `${path}/`;
    }
    const fullPath = `${process.env.HOME}${path}`;
    const stats = await getStats(path);
    if (stats.type !== 'directory') {
        return { error: `Path must be a directory`};
    }

    // Get next new file name
    const fileNamePrefix = 'untitled'
    let fileNameIndex = 0;

    let fileExists = true;
    let filePath = '';
    let fullFilePath = '';
    do {
        const fileName = fileNameIndex === 0 ? `${fileNamePrefix}.txt` : `${fileNamePrefix}${fileNameIndex}.txt`;
        filePath = `${path}${fileName}`;    
        fullFilePath = `${fullPath}${fileName}`;
        fileExists = exists(filePath);
        fileNameIndex++;

    } while (fileExists);

    try {
        await writeFile(fullFilePath, '');

        const newFileStats = await getStats(filePath);
        return { stats: newFileStats }

    } catch (error) {
        logger.error(`Failed to create new file: ${errMsg(error)}`);
        throw error;
    }
}

export const FilesService = {
    exists,
    getContent,
    createContent,
    deleteContent,
    moveContent,
    performContentAction,
}