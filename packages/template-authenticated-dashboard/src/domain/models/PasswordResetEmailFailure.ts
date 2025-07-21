import { Failure } from '@jsfsi-core/ts-crossplatform';

export class PasswordResetEmailFailure extends Failure {
  constructor(public readonly error: unknown) {
    super();
  }
}
