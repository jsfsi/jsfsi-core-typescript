import { describe, expect, it } from 'vitest';

import { Failure, isFailure } from '../failures';

import { Fail, Ok, Result } from './result';

describe('ResultTuple', () => {
  describe('result with value', () => {
    it('returns value', () => {
      const doSomething = (): Result<number, Failure> => Ok(1);

      const [value, error] = doSomething();

      expect(value).toEqual(1);
      expect(error).toBeUndefined();
    });

    it('returns value object with properties', () => {
      const doSomething = (): Result<{ foo: string }, Failure> => Ok({ foo: 'bar' });

      const [value] = doSomething();

      expect(value.foo).toEqual('bar');
    });
  });

  describe('result with failure', () => {
    it('returns failure', () => {
      const doSomething = () => Fail(new Failure());

      const [value, failure] = doSomething();

      expect(value).toBeUndefined();
      expect(failure).toEqual(new Failure());
    });

    it('returns custom failure', () => {
      class CustomFailure extends Failure {
        constructor(public readonly message: string) {
          super();
        }
      }

      const doSomething = () => Fail(new CustomFailure('error'));

      const [value, failure] = doSomething();

      expect(value).toBeUndefined();
      expect(failure).toEqual(new CustomFailure('error'));
      expect(isFailure(CustomFailure)(failure)).toBe(true);
    });

    it('returns multiple custom failure types', () => {
      class CustomFailure extends Failure {}
      class AnotherCustomFailure extends Failure {}

      const doSomething = (
        failureType: 'custom' | 'another',
      ): Result<number, CustomFailure | AnotherCustomFailure> =>
        failureType === 'custom' ? Fail(new CustomFailure()) : Fail(new AnotherCustomFailure());

      const [customValue, customFailure] = doSomething('custom');
      const [anotherValue, anotherCustomFailure] = doSomething('another');

      expect(customValue).toBeUndefined();
      expect(anotherValue).toBeUndefined();
      expect(customFailure).toEqual(new CustomFailure());
      expect(anotherCustomFailure).toEqual(new AnotherCustomFailure());
      expect(isFailure(CustomFailure)(customFailure)).toBe(true);
      expect(isFailure(AnotherCustomFailure)(anotherCustomFailure)).toBe(true);
    });

    it('returns value without Ok function', () => {
      const doSomething = (): Result<number, Failure> => [1, undefined];

      const [value, failure] = doSomething();

      expect(value).toEqual(1);
      expect(failure).toBeUndefined();
    });

    it('returns failure without Fail function', () => {
      const doSomething = (): Result<undefined, Failure> => [undefined, new Failure()];

      const [value, failure] = doSomething();

      expect(value).toBeUndefined();
      expect(isFailure(Failure)(failure)).toEqual(true);
    });

    it('returns undefined value for void', () => {
      const doSomething = () => Ok(undefined);

      const [value, failure] = doSomething();

      expect(value).toBeUndefined();
      expect(failure).toBeUndefined();
    });
  });
});
