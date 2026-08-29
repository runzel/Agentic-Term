import type { AppError } from '@/types';

/**
 * Creates a typed application error
 */
export function createError(
  code: string,
  message: string,
  context?: Record<string, unknown>
): AppError {
  const error = new Error(message) as AppError;
  error.code = code;
  error.context = context;
  return error;
}

/**
 * Type guard for AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof Error && 'code' in error && typeof (error as AppError).code === 'string';
}

/**
 * Extract error message safely
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}
