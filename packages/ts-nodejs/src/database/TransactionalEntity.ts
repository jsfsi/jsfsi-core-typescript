export interface TransactionalEntity<T = unknown> {
  withTransaction: (executer: (entity: T) => Promise<void>) => Promise<void>;

  withRepositoryManager: (repositoryManager: TransactionalEntity) => this;
}
