import { ValidationPipe } from '@nestjs/common';
import type { NestNodeApplication } from '@nestjs/platform-node';

import { AllExceptionFilter } from '../common/filters/all-exception.filter.js';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor.js';
import { LifecycleService } from '../infrastructure/lifecycle/lifecycle.service.js';
import { RequestLifecycleInterceptor } from '../infrastructure/lifecycle/request-lifecycle.interceptor.js';
import { EnvironmentService } from './environment.service.js';
import { ApplicationHttpAdapter } from './http-adapter.js';
import { setupSwagger } from './swagger.config.js';

export function configureHttpApp(app: NestNodeApplication): void {
  const environmentService = app.get(EnvironmentService);

  const lifecycle = app.get(LifecycleService);
  const adapter = app.getHttpAdapter();
  if (!(adapter instanceof ApplicationHttpAdapter))
    throw new Error('Configure the application with createHttpAdapter()');
  adapter.setDrainHandler(() => lifecycle.drain());
  app.use(lifecycle.middleware);
  app.useGlobalInterceptors(new RequestLifecycleInterceptor());

  app.enableCors({
    origin: environmentService.frontendOrigin,
    credentials: true,
    exposedHeaders: [
      'X-Request-Id',
      'Retry-After',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
  });

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (!environmentService.isProduction) setupSwagger(app);
}
