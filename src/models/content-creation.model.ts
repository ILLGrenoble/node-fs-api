export interface ContentCreation {
    type: 'file' | 'directory';
    name: string;
    content?: string;
    format?: 'base64' | 'utf-8';
    chunk?: number;
}