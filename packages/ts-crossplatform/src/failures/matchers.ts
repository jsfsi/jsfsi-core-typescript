import { Failure } from './failure';

export const notFailure =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <F extends Failure>(f: new (...args: any[]) => F) =>
    <T>(m: T | F): m is Exclude<T, F> =>
      !(m instanceof f);

export const isFailure =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <F extends Failure>(f: new (...args: any[]) => F) =>
    <T>(m: T | F): m is F =>
      m instanceof f;
