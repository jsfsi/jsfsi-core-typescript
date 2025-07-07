export type LogLevel = 'debug' | 'verbose' | 'log' | 'warn' | 'error' | 'fatal';

export type ConsoleLogMethod = 'debug' | 'log' | 'warn' | 'error';

export const LogLevelToConsoleMethodMap: Record<LogLevel, ConsoleLogMethod> = {
  debug: 'debug',
  verbose: 'debug',
  log: 'log',
  warn: 'warn',
  error: 'error',
  fatal: 'error',
};

export interface Logger {
  debug(message: string): void;
  verbose(message: string): void;
  log(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  fatal(message: string): void;

  setLogLevels(levels: LogLevel[]): void;
}
