import { INestApplication, LoggerService, Type } from '@nestjs/common';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';

import { createApp } from '../app/app';

export type Override<T = unknown> = {
  type: T;
  value: T;
};

type TestingAppOverrides = {
  guards?: Override[];
  providers?: Override[];
  logger?: LoggerService;
};

function overrideGuards(builder: TestingModuleBuilder, guards: Override[] = []) {
  guards.forEach((guard) => {
    builder = builder.overrideGuard(guard.type).useValue(guard.value);
  });
  return builder;
}

function overrideProviders(builder: TestingModuleBuilder, providers: Override[] = []) {
  providers.forEach((provider) => {
    builder = builder.overrideProvider(provider.type).useValue(provider.value);
  });
  return builder;
}

export async function createTestingModule(
  overrides: TestingAppOverrides = {},
  appModule: Type,
): Promise<TestingModule> {
  let builder = Test.createTestingModule({
    imports: [appModule],
  });

  builder = overrideGuards(builder, overrides.guards);
  builder = overrideProviders(builder, overrides.providers);

  const moduleFixture: TestingModule = await builder.compile();

  if (overrides.logger) {
    moduleFixture.useLogger(overrides.logger);
  }

  return moduleFixture;
}

export async function createTestingApp(
  appModule: Type,
  overrides: TestingAppOverrides = {},
): Promise<INestApplication> {
  const moduleFixture = await createTestingModule(overrides, appModule);
  const app = await createApp({
    existentApp: moduleFixture.createNestApplication(),
    existentLogger: overrides.logger,
  });

  return app.init();
}
