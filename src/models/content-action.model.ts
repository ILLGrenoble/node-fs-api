export interface ContentAction {
    action: 'COPY_TO' | 'NEW_FOLDER' | 'NEW_FILE';
    path?: string;
}