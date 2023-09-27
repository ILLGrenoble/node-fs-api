import { FileStats } from "./file-stats.model";

export interface CreationResult {
    stats?: FileStats;
    error?: string;
}