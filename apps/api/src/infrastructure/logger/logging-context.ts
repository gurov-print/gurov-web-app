import { AsyncLocalStorage } from 'node:async_hooks';

export interface LoggingContext {
  requestId: string;
  jobId?: string;
}

export const loggingContext = new AsyncLocalStorage<LoggingContext>();
