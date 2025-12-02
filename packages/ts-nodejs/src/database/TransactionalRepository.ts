import { DataSource, EntityManager, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

import { TransactionalEntity } from './TransactionalEntity';

type LockMode =
  | 'pessimistic_read'
  | 'pessimistic_write'
  | 'dirty_read'
  | 'pessimistic_partial_write'
  | 'pessimistic_write_or_fail';

export abstract class TransactionalRepository implements TransactionalEntity<TransactionalRepository> {
  private em?: EntityManager;

  constructor(protected readonly dataSource: DataSource) {}

  private static newInstance(instance: TransactionalRepository): TransactionalRepository {
    const RepositoryType = instance.constructor as new (ds: DataSource) => TransactionalRepository;
    return new RepositoryType(instance.dataSource);
  }

  private withEntityManager(em?: EntityManager): this {
    this.em = em;
    return this;
  }

  public withRepositoryManager(repositoryManager: TransactionalRepository): this {
    return TransactionalRepository.newInstance(this).withEntityManager(
      repositoryManager.em,
    ) as this;
  }

  public lockInTransaction(mode: LockMode = 'pessimistic_write'): { mode: LockMode } | undefined {
    return this.em
      ? {
          mode,
        }
      : undefined;
  }

  protected getRepository<T extends ObjectLiteral>(type: EntityTarget<T>): Repository<T> {
    return this.em ? this.em.getRepository(type) : this.dataSource.getRepository(type);
  }

  public async withTransaction<T>(executer: (repository: this) => Promise<T>): Promise<T> {
    let result: T;

    await this.dataSource.transaction(async (em) => {
      result = await executer(
        TransactionalRepository.newInstance(this).withEntityManager(em) as this,
      );
    });

    return result!;
  }
}
