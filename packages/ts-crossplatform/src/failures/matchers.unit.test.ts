import { describe, expect, it } from 'vitest';

import { Failure } from './failure';
import { isFailure, notFailure } from './matchers';

class FailureWithSingleProperty extends Failure {
  constructor(public readonly property: string) {
    super();
  }
}

class FailureWithMultipleProperties extends Failure {
  constructor(
    public readonly property1: string,
    public readonly property2: string,
  ) {
    super();
  }
}

describe('matchers', () => {
  it('matches when is not a failure', () => {
    class NotAFailure {}

    const result = notFailure(Failure)(NotAFailure);

    expect(result).toBe(true);
  });

  it('matches when is not a failure with single property', () => {
    const result = notFailure(FailureWithSingleProperty)(new Failure());

    expect(result).toBe(true);
  });

  it('matches when is not a failure with multiple properties', () => {
    const result = notFailure(FailureWithMultipleProperties)(new Failure());

    expect(result).toBe(true);
  });

  it('matches when is a failure', () => {
    const result = isFailure(Failure)(new Failure());

    expect(result).toBe(true);
  });

  it('matches when is a failure with single property', () => {
    const result = isFailure(FailureWithSingleProperty)(new FailureWithSingleProperty('test'));

    expect(result).toBe(true);
  });

  it('matches when is a failure with multiple properties', () => {
    const result = isFailure(FailureWithMultipleProperties)(
      new FailureWithMultipleProperties('test1', 'test2'),
    );

    expect(result).toBe(true);
  });
});
