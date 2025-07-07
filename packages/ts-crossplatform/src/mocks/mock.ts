import { type RecursivePartial } from '../partials/RecursivePartial';

export const mock = <T>(input: RecursivePartial<T> = {}): T => input as T;
