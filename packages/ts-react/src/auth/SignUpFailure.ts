import { Failure } from '@jsfsi-core/ts-crossplatform';

export class SignUpFailure extends Failure {
  constructor(public readonly error: unknown) {
    super();
  }
}
