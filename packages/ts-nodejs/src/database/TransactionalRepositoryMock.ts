import { type TransactionalEntity } from './TransactionalEntity';

export const buildTransactionalRepositoryMock = <T extends TransactionalEntity>(instance: T): T => {
  return {
    ...instance,
    withTransaction: async <R>(executer: (repository: T) => Promise<R>): Promise<R> => {
      return await executer(instance);
    },
    withRepositoryManager: () => instance,
  };
};
