/* c8 ignore file */

import { Logger } from './Logger';

export class MockLogger implements Logger {
  debug = () => undefined;

  verbose = () => undefined;

  log = () => undefined;

  warn = () => undefined;

  error = () => undefined;

  fatal = () => undefined;

  setLogLevels = () => undefined;
}
