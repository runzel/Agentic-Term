import type { LogEntry } from '@/types';
import { getEnvVar } from './env';

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private minLevel: number;
  private logs: LogEntry[] = [];

  constructor() {
    const level = getEnvVar('VITE_LOG_LEVEL');
    this.minLevel = LOG_LEVELS[level];
  }

  private formatTime(): string {
    return new Date().toISOString();
  }

  private addLog(level: LogEntry['level'], message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: this.formatTime(),
      level,
      message,
      context,
    };
    this.logs.push(entry);
    // Keep last 1000 logs
    if (this.logs.length > 1000) {
      this.logs.shift();
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (LOG_LEVELS.debug >= this.minLevel) {
      this.addLog('debug', message, context);
      console.debug(`[DEBUG] ${message}`, context);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (LOG_LEVELS.info >= this.minLevel) {
      this.addLog('info', message, context);
      console.info(`[INFO] ${message}`, context);
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (LOG_LEVELS.warn >= this.minLevel) {
      this.addLog('warn', message, context);
      console.warn(`[WARN] ${message}`, context);
    }
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    if (LOG_LEVELS.error >= this.minLevel) {
      const errorContext = {
        ...context,
        ...(error instanceof Error && {
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack,
        }),
      };
      this.addLog('error', message, errorContext);
      console.error(`[ERROR] ${message}`, error, errorContext);
    }
  }

  getLogs(level?: LogEntry['level']): LogEntry[] {
    if (!level) return this.logs;
    return this.logs.filter((log) => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger();
