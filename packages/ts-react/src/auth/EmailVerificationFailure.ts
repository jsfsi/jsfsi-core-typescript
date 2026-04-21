import { Failure } from '@jsfsi-core/ts-crossplatform';

export class EmailVerificationFailure extends Failure {
  constructor(public readonly error: unknown) {
    super();
  }
}
