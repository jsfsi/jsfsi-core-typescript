import type { Failure } from './failure';

export const notFailure =
  // biome-ignore lint/suspicious/noExplicitAny: required for type-safe failure matching
    <F extends Failure>(f: new (...args: any[]) => F) =>
    <T>(m: T | F): m is Exclude<T, F> =>
      !(m instanceof f);

export const isFailure =
  // biome-ignore lint/suspicious/noExplicitAny: required for type-safe failure matching
    <F extends Failure>(f: new (...args: any[]) => F) =>
    <T>(m: T | F): m is F =>
      m instanceof f;
