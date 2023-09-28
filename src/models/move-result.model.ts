import { FileStats } from "./file-stats.model";

export interface MoveResult {
    stats?: FileStats;
    error?: string;
}