import { FileStats } from "./file-stats.model";

export interface FileContent {
    content: string;
    stats: FileStats;
    format: string;
    mimetype: string;
}