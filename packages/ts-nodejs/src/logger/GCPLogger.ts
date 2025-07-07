import safeStringify from 'fast-safe-stringify';

import { ConsoleLogMethod, Logger, LogLevel, LogLevelToConsoleMethodMap } from './Logger';

type GCPLogSeverity =
  | 'DEFAULT'
  | 'DEBUG'
  | 'INFO'
  | 'NOTICE'
  | 'WARNING'
  | 'ERROR'
  | 'CRITICAL'
  | 'ALERT'
  | 'EMERGENCY';

type GCPLogMessage<T> = {
  textPayload?: string;
  context?: string;
  metadata?: T;
  error?: string;
  trace?: object;
};

type GCPLog<T> = {
  severity: GCPLogSeverity;
  textPayload?: string;
  message: GCPLogMessage<T>;
};

const gcpLogSeverityMapper: { [key: string]: GCPLogSeverity } = {
  verbose: 'DEFAULT',
  debug: 'DEBUG',
  log: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL',
};

const SENSITIVE_KEYS = [
  'x-api-key',
  'x-api-token',
  'x-key',
  'x-token',
  'cookie',
  'password',
  'pass',
  'psw',
  'auth',
  'authentication',
  'authorization',
  'token',
  'access_token',
  'client-secret',
  'credentials',
  'secret',
];

type GCPLoggerOptions = {
  logLevels?: ReadonlyArray<LogLevel>;
};

export class GCPLogger implements Logger {
  private levels: Set<LogLevel> = new Set(['verbose', 'debug', 'log', 'warn', 'error', 'fatal']);

  constructor(
    private readonly module: string,
    options: GCPLoggerOptions = {},
  ) {
    if (options.logLevels) {
      this.levels = new Set(options.logLevels);
    }
  }

  private mapLogLevelToConsoleMethod(logLevel: LogLevel): ConsoleLogMethod {
    return LogLevelToConsoleMethodMap[logLevel];
  }

  private write<T extends object, E extends Error>(
    level: LogLevel,
    message: unknown,
    context?: string,
    metadata?: T | string,
    error?: E | string,
  ) {
    if (!this.levels.has(level)) {
      return;
    }
    const log = this.buildLog(level, message, context, metadata, error);

    const safeLog = safeStringify(log, this.sensitiveReplacer);

    const consoleMethod = this.mapLogLevelToConsoleMethod(level);

    // eslint-disable-next-line no-console
    console[consoleMethod](safeLog);
  }

  private buildLog<T extends object, E extends Error>(
    level: LogLevel,
    message: unknown,
    context?: string,
    metadata?: T | string,
    error?: E | string,
  ): GCPLog<T> {
    const { writeMetadata, writeContext, writeError } = this.sanitizeLog(context, metadata, error);

    const gcpMessage: GCPLogMessage<T> = {};

    if (typeof message === 'string') {
      gcpMessage.textPayload = message;
    }

    if (!writeMetadata && typeof message !== 'string' && !(message instanceof Error)) {
      gcpMessage.metadata = message as T;
    }

    if (message instanceof Error) {
      gcpMessage.error = JSON.stringify(message, Object.getOwnPropertyNames(message));
    }

    // NOTE: avoid adding undefined fields to message
    if (writeContext) {
      gcpMessage.context = writeContext;
    }

    // NOTE: avoid adding undefined fields to message
    if (writeMetadata) {
      gcpMessage.metadata = writeMetadata as T;
    }

    // NOTE: avoid adding undefined fields to message
    if (!gcpMessage.error && writeError) {
      gcpMessage.error = JSON.stringify(writeError, Object.getOwnPropertyNames(writeError));
    }

    return {
      severity: gcpLogSeverityMapper[level],
      module: this.module,
      textPayload: gcpMessage.textPayload,
      message: gcpMessage,
    } as GCPLog<T>;
  }

  private sanitizeLog<T extends object, E extends Error>(
    context?: string,
    metadata?: T | string,
    error?: E | string,
  ) {
    if (metadata instanceof Error && (!error || typeof error === 'string')) {
      return {
        writeMetadata: undefined,
        writeContext: context ? context : error,
        writeError: metadata,
      };
    }

    let m = metadata;
    let ctx = context;

    if (typeof m === 'string' && !context) {
      ctx = m;
      m = undefined;
    }

    return {
      writeMetadata: m,
      writeContext: ctx,
      writeError: error,
    };
  }

  private sensitiveReplacer(key: string, value: unknown) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      return '[HIDDEN BY LOGGER]';
    }
    return value;
  }

  public debug<T extends object>(message: unknown, metadata?: T | string, context?: string) {
    this.write('debug', message, context, metadata);
  }

  public verbose<T extends object>(message: unknown, metadata?: T | string, context?: string) {
    this.write('verbose', message, context, metadata);
  }

  public log<T extends object>(message: unknown, metadata?: T | string, context?: string) {
    this.write('log', message, context, metadata);
  }

  public warn<T extends object, E extends Error>(
    message: unknown,
    metadata?: T | string,
    error?: E | string,
    context?: string,
  ) {
    this.write('warn', message, context, metadata, error);
  }

  public error<T extends object, E extends Error>(
    message: unknown,
    metadata?: T | string,
    error?: E | string,
    context?: string,
  ) {
    this.write('error', message, context, metadata, error);
  }

  public fatal<T extends object, E extends Error>(
    message: unknown,
    metadata?: T | string,
    error?: E | string,
    context?: string,
  ) {
    this.write('fatal', message, context, metadata, error);
  }

  public setLogLevels(levels: LogLevel[]) {
    this.levels = new Set(levels);
  }
}
