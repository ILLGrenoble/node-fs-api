export * from './logger'

export function sleep(timeMs: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, timeMs);
    });
}

export function errMsg(error: any): string {
    if (error != null && error.message) {
        return error.message;
    }
    return error;
}