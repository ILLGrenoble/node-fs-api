import { FileStats } from "./file-stats.model";

export interface ActionResult {
    stats?: FileStats;
    error?: string;
}