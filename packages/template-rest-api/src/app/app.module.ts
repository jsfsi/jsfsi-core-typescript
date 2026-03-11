import { appConfigModuleSetup, RequestMiddleware } from '@jsfsi-core/ts-nestjs';
import { REQUEST_MIDDLEWARE_LOG_CUSTOMIZER } from '@jsfsi-core/ts-nestjs';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule, Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthorizationAdapter } from '../adapters/authorization-adapter/AuthorizationAdapter';
import { HealthController } from '../communication/controllers/health/health.controller';
import { AuthorizeGuard } from '../communication/guards/authorize.guard';
import { GlobalRateLimitGuard } from '../communication/guards/global-rate-limit.guard';
import { UserGuard } from '../communication/guards/user.guard';
import { RequestUserLogCustomizer } from '../communication/middlewares/RequestUserLogCustomizer';
import { HealthService } from '../domain/services/health-service/Health.service';
import { UserService } from '../domain/services/user-service/UserService';

import { rateLimitConfigModuleSetup } from './rate-limit-configuration.service';

const controllers = [HealthController];
const services: Provider[] = [HealthService, UserService];
const adapters: Provider[] = [AuthorizationAdapter];

const middlewares: Provider[] = [
  {
    provide: REQUEST_MIDDLEWARE_LOG_CUSTOMIZER,
    useClass: RequestUserLogCustomizer,
  },
];

const guards: Provider[] = [
  {
    provide: APP_GUARD,
    useClass: UserGuard, // Applies to all routes
  },
  {
    provide: APP_GUARD,
    useClass: AuthorizeGuard, // Will only run if @Auth(...roles) is present
  },
  GlobalRateLimitGuard,
];

@Module({
  imports: [appConfigModuleSetup(), rateLimitConfigModuleSetup(), HttpModule],
  controllers: [...controllers],
  providers: [...services, ...guards, ...adapters, ...middlewares],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestMiddleware).forRoutes('*');
  }
}
