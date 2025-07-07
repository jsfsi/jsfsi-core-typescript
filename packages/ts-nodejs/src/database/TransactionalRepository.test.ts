import { mock } from '@jsfsi-core/ts-crossplatform';
import { type DataSource, type EntityManager } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { TransactionalRepository } from './TransactionalRepository';

describe('#TransactionalRepository', () => {
  let findSomethingMock: Mock;

  class ExtendedString extends String {}

  class TestRepository extends TransactionalRepository {
    constructor(options: { dataSource: DataSource }) {
      super(options?.dataSource);
    }

    public findSomething = findSomethingMock;

    public findOtherTableData: () => Promise<ExtendedString[]> = async () =>
      await this.getRepository(ExtendedString).find();

    public returnSomething = async (): Promise<string | undefined> => 'something';
  }

  class AnotherTestRepository extends TransactionalRepository {
    constructor(options: { dataSource: DataSource }) {
      super(options?.dataSource);
    }
  }

  beforeEach(() => {
    findSomethingMock = vi.fn();
  });

  afterEach(vi.clearAllMocks);

  it('creates transaction and executes the inner code', async () => {
    const testRepository = new TestRepository({
      dataSource: mock<DataSource>({
        transaction: async (runInTransaction: (entityManager: EntityManager) => Promise<void>) => {
          await runInTransaction(mock<EntityManager>());
        },
      }),
    });

    const result = await testRepository.withTransaction(async (repo: TestRepository) => {
      return await repo.returnSomething();
    });

    expect(result).toBe('something');
  });

  it('returns transaction inner code result', async () => {
    const testRepository = new TestRepository({
      dataSource: mock<DataSource>({
        transaction: async (runInTransaction: (entityManager: EntityManager) => Promise<void>) => {
          await runInTransaction(mock<EntityManager>());
        },
      }),
    });

    await testRepository.withTransaction(async (repo: TestRepository) => {
      await repo.findSomething();
    });

    expect(findSomethingMock).toHaveBeenCalledTimes(1);
  });

  it('get entity manager repository within the transaction', async () => {
    const findMock = vi.fn();

    const testRepository = new TestRepository({
      dataSource: mock<DataSource>({
        transaction: async (runInTransaction: (entityManager: EntityManager) => Promise<void>) => {
          await runInTransaction(
            mock<EntityManager>({
              getRepository: () => ({
                find: findMock,
              }),
            }),
          );
        },
      }),
    });

    await testRepository.withTransaction(async (repo: TestRepository) => {
      await repo.findOtherTableData();
    });

    expect(findMock).toHaveBeenCalledTimes(1);
  });

  it('get entity manager repository without the transaction', async () => {
    const findMock = vi.fn();

    const testRepository = new TestRepository({
      dataSource: mock<DataSource>({
        transaction: async (runInTransaction: (entityManager: EntityManager) => Promise<void>) => {
          await runInTransaction(mock<EntityManager>());
        },
        getRepository: () => ({
          find: findMock,
        }),
      }),
    });

    await testRepository.findOtherTableData();

    expect(findMock).toHaveBeenCalledTimes(1);
  });

  it('get lock in transaction with transaction', async () => {
    const testRepository = new TestRepository({
      dataSource: mock<DataSource>({
        transaction: async (runInTransaction: (entityManager: EntityManager) => Promise<void>) => {
          await runInTransaction(mock<EntityManager>());
        },
      }),
    });

    let lockMode: { mode: string } | undefined;

    await testRepository.withTransaction(async (repo: TestRepository) => {
      lockMode = repo.lockInTransaction();

      return Promise.resolve();
    });

    expect(lockMode).toEqual({ mode: 'pessimistic_write' });
  });

  it('get lock in transaction with custom mode', async () => {
    const testRepository = new TestRepository({
      dataSource: mock<DataSource>({
        transaction: async (runInTransaction: (entityManager: EntityManager) => Promise<void>) => {
          await runInTransaction(mock<EntityManager>());
        },
      }),
    });

    let lockMode: { mode: string } | undefined;

    await testRepository.withTransaction(async (repo: TestRepository) => {
      lockMode = repo.lockInTransaction('pessimistic_read');

      return Promise.resolve();
    });

    expect(lockMode).toEqual({ mode: 'pessimistic_read' });
  });

  it('get lock in transaction without transaction', () => {
    const testRepository = new TestRepository({ dataSource: mock<DataSource>() });

    const lockMode = testRepository.lockInTransaction();

    expect(lockMode).toBeUndefined();
  });

  it('get another repository instance with repository manager', () => {
    const testRepository = new TestRepository({ dataSource: mock<DataSource>() });
    const anotherRepository = new AnotherTestRepository({
      dataSource: mock<DataSource>(),
    });

    const someRepository = anotherRepository.withRepositoryManager(testRepository);

    expect(someRepository).toBeInstanceOf(AnotherTestRepository);
  });
});
