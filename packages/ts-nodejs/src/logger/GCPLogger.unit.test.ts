import { afterEach, describe, expect, it, vi } from 'vitest';

import { ConsoleLogMethod, LogLevel, GCPLogger } from '.';

type LoggerMethod = (...args: unknown[]) => void;
type LoggerMethodKeys = Extract<keyof Omit<GCPLogger, 'setLogLevels'>, string>;

describe('GCPLogger', () => {
  afterEach(vi.clearAllMocks);

  it.each`
    action       | consoleLogMethod | expectedSeverity
    ${'verbose'} | ${'debug'}       | ${'DEFAULT'}
    ${'debug'}   | ${'debug'}       | ${'DEBUG'}
    ${'log'}     | ${'log'}         | ${'INFO'}
    ${'warn'}    | ${'warn'}        | ${'WARNING'}
    ${'error'}   | ${'error'}       | ${'ERROR'}
    ${'fatal'}   | ${'error'}       | ${'CRITICAL'}
  `(
    'logs a string message for action $action as expected',
    ({
      action,
      consoleLogMethod,
      expectedSeverity,
    }: {
      action: LogLevel;
      consoleLogMethod: ConsoleLogMethod;
      expectedSeverity: string;
    }) => {
      const consoleMethodSpy = vi.spyOn(console, consoleLogMethod).mockReturnValue();

      const gcpLogger = new GCPLogger('test-module', {
        logLevels: [action],
      });

      (gcpLogger[action as LoggerMethodKeys] as LoggerMethod)('test message');

      expect(consoleMethodSpy).toHaveBeenCalledTimes(1);
      expect(consoleMethodSpy).toHaveBeenCalledWith(
        JSON.stringify({
          severity: expectedSeverity,
          module: 'test-module',
          textPayload: 'test message',
          message: { textPayload: 'test message' },
        }),
      );
    },
  );

  it.each`
    type         | value
    ${'number'}  | ${1}
    ${'boolean'} | ${true}
    ${'array'}   | ${[1, 2, 3, 4]}
    ${'object'}  | ${{ foo: 'bar' }}
  `('logs a $type as a message', ({ value }) => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockReturnValue();

    const gcpLogger = new GCPLogger('test-module', {
      logLevels: ['log'],
    });

    gcpLogger.log(value);

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      JSON.stringify({
        severity: 'INFO',
        module: 'test-module',
        message: { metadata: value },
      }),
    );
  });

  it('logs unwrapped optional params', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockReturnValue();

    const gcpLogger = new GCPLogger('test-module', {
      logLevels: ['log'],
    });

    gcpLogger.log('some message', { a: 1 }, 'tag1');

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      JSON.stringify({
        severity: 'INFO',
        module: 'test-module',
        textPayload: 'some message',
        message: { textPayload: 'some message', context: 'tag1', metadata: { a: 1 } },
      }),
    );
  });

  it('logs unwrapped optional params (override case)', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockReturnValue();

    const gcpLogger = new GCPLogger('test-module', {
      logLevels: ['log'],
    });

    (gcpLogger.log as LoggerMethod)('some message', { a: 1 }, { a: 2 });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      JSON.stringify({
        severity: 'INFO',
        module: 'test-module',
        textPayload: 'some message',
        message: { textPayload: 'some message', context: { a: 2 }, metadata: { a: 1 } },
      }),
    );
  });

  it('set log levels', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockReturnValue();
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockReturnValue();

    const gcpLogger = new GCPLogger('test-module', {
      logLevels: ['log', 'warn'],
    });

    gcpLogger.log('some message');
    gcpLogger.warn('some message');

    gcpLogger.setLogLevels(['warn']);

    gcpLogger.log('some message');
    gcpLogger.warn('some message');

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
  });

  it.each([
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
    'Authorization',
  ])('doesnt log sensitive keys %s', (sensitiveKey) => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockReturnValue();

    const gcpLogger = new GCPLogger('test-module', {
      logLevels: ['log'],
    });

    gcpLogger.log({
      msg: `${sensitiveKey}: some secret value`,
      [sensitiveKey]: 'NOT HIDDEN',
    });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      JSON.stringify({
        severity: 'INFO',
        module: 'test-module',
        message: {
          metadata: {
            msg: `${sensitiveKey}: some secret value`,
            [sensitiveKey]: '[HIDDEN BY LOGGER]',
          },
        },
      }),
    );
  });

  it('logs an error with metadata', () => {
    const someError = new Error('some error');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockReturnValue();

    const gcpLogger = new GCPLogger('test-module', {
      logLevels: ['error'],
    });

    gcpLogger.error('some message', { foo: 'bar' }, someError);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      JSON.stringify({
        severity: 'ERROR',
        module: 'test-module',
        textPayload: 'some message',
        message: {
          textPayload: 'some message',
          metadata: { foo: 'bar' },
          error: JSON.stringify(someError, Object.getOwnPropertyNames(someError)),
        },
      }),
    );
  });

  it('logs an error without metadata', () => {
    const someError = new Error('some error');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockReturnValue();

    const gcpLogger = new GCPLogger('test-module', {
      logLevels: ['error'],
    });

    gcpLogger.error('some message', someError);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      JSON.stringify({
        severity: 'ERROR',
        module: 'test-module',
        textPayload: 'some message',
        message: {
          textPayload: 'some message',
          error: JSON.stringify(someError, Object.getOwnPropertyNames(someError)),
        },
      }),
    );
  });

  it('logs an error with context', () => {
    const someError = new Error('some error');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockReturnValue();

    const gcpLogger = new GCPLogger('test-module', {
      logLevels: ['error'],
    });

    gcpLogger.error('some message', someError, 'some-context');

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      JSON.stringify({
        severity: 'ERROR',
        module: 'test-module',
        textPayload: 'some message',
        message: {
          textPayload: 'some message',
          context: 'some-context',
          error: JSON.stringify(someError, Object.getOwnPropertyNames(someError)),
        },
      }),
    );
  });

  it('logs an error with metadata and context', () => {
    const someError = new Error('some error');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockReturnValue();

    const gcpLogger = new GCPLogger('test-module', {
      logLevels: ['error'],
    });

    gcpLogger.error('some message', someError, undefined, 'some-context');

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      JSON.stringify({
        severity: 'ERROR',
        module: 'test-module',
        textPayload: 'some message',
        message: {
          textPayload: 'some message',
          context: 'some-context',
          error: JSON.stringify(someError, Object.getOwnPropertyNames(someError)),
        },
      }),
    );
  });

  it('logs with string metadata', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockReturnValue();

    const gcpLogger = new GCPLogger('test-module', {
      logLevels: ['log'],
    });

    gcpLogger.log('some message', 'some-metadata', 'some-context');

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      JSON.stringify({
        severity: 'INFO',
        module: 'test-module',
        textPayload: 'some message',
        message: {
          textPayload: 'some message',
          context: 'some-context',
          metadata: 'some-metadata',
        },
      }),
    );
  });

  it('logs with object metadata and without message', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockReturnValue();

    const gcpLogger = new GCPLogger('test-module', {
      logLevels: ['log'],
    });

    gcpLogger.log({ foo: 'bar' }, 'some-context');

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      JSON.stringify({
        severity: 'INFO',
        module: 'test-module',
        message: {
          metadata: { foo: 'bar' },
          context: 'some-context',
        },
      }),
    );
  });

  it('logs message as error when message is of type error', () => {
    const someError = new Error('some error');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockReturnValue();

    const gcpLogger = new GCPLogger('test-module', {
      logLevels: ['error'],
    });

    gcpLogger.error(someError, undefined, 'some-context');

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      JSON.stringify({
        severity: 'ERROR',
        module: 'test-module',
        message: {
          error: JSON.stringify(someError, Object.getOwnPropertyNames(someError)),
        },
      }),
    );
  });
});
