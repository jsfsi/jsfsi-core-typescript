import { Failure } from '../../failures/failure';

export class ValidationFailure extends Failure {
  constructor(
    public readonly error: unknown,
    public readonly metadata?: unknown,
  ) {
    super();
  }
}
