import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestNodeApplication } from '@nestjs/platform-node';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module.js';
import { EnvironmentService } from './config/environment.service.js';
import { createHttpAdapter } from './config/http-adapter.js';
import { configureHttpApp } from './config/http.config.js';
import { parseTrustedProxies } from './config/proxy.config.js';

async function bootstrap() {
  // The adapter needs proxy options before Nest creates the HTTP server.
  await ConfigModule.envVariablesLoaded;
  const app = await NestFactory.create<NestNodeApplication>(
    AppModule,
    createHttpAdapter(parseTrustedProxies(process.env.TRUSTED_PROXIES ?? '')),
    { bufferLogs: true },
  );

  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();

  const environmentService = app.get(EnvironmentService);

  configureHttpApp(app);

  await app.listen(environmentService.AppPort);
}

await bootstrap();
