import { Failure } from '@jsfsi-core/ts-crossplatform';

export class UnableToValidateUserFailure extends Failure {
  public static readonly message = 'Unable to validate user';

  constructor(public readonly error?: Error) {
    super();
  }
}
