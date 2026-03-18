import { Failure } from '../../failures/failure';

export class NetworkFailure extends Failure {
  constructor(public readonly error: unknown) {
    super();
  }
}
