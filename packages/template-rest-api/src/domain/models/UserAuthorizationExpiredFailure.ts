import { Failure } from '@jsfsi-core/ts-crossplatform';

export class UserAuthorizationExpiredFailure extends Failure {
  constructor(public readonly error?: Error) {
    super();
  }
}
