/**
 * Structured logger for server-side operations.
 *
 * In production, outputs JSON for easy ingestion by log aggregators
 * (e.g. Datadog, Logtail, Vercel Log Drains).
 * In development, outputs human-readable format.
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    [key: string]: unknown;
}

const isProd = process.env.NODE_ENV === 'production';

function formatEntry(entry: LogEntry): string {
    if (isProd) {
        return JSON.stringify({
            ...entry,
            timestamp: new Date().toISOString(),
            service: 'kyoty-web',
        });
    }
    const { level, message, ...meta } = entry;
    const prefix = `[${level.toUpperCase()}]`;
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${prefix} ${message}${metaStr}`;
}

export const logger = {
    info(message: string, meta: Record<string, unknown> = {}) {
        console.log(formatEntry({ level: 'info', message, ...meta }));
    },

    warn(message: string, meta: Record<string, unknown> = {}) {
        console.warn(formatEntry({ level: 'warn', message, ...meta }));
    },

    error(message: string, error?: unknown, meta: Record<string, unknown> = {}) {
        const errorInfo: Record<string, unknown> = {};
        if (error instanceof Error) {
            errorInfo.errorMessage = error.message;
            errorInfo.errorStack = error.stack;
        } else if (error) {
            errorInfo.errorRaw = String(error);
        }
        console.error(formatEntry({ level: 'error', message, ...errorInfo, ...meta }));
    },
};
