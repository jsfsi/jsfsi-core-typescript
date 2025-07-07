import { Failure } from '../failures/failure';

export type Result<T = undefined, E extends Failure | undefined = Failure> = [T, E | undefined];

export const Ok = <T>(value: T): Result<T, undefined> => [value, undefined];

export const Fail = <T = undefined, E extends Failure = Failure>(failure: E): Result<T, E> => [
  undefined as T,
  failure,
];
