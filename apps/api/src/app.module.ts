import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EnvironmentModule } from './config/environment.module.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { EmailModule } from './infrastructure/email/email.module.js';
import { LifecycleModule } from './infrastructure/lifecycle/lifecycle.module.js';
import { LoggerModule } from './infrastructure/logger/logger.module.js';
import { MediaProcessingModule } from './infrastructure/media-processing/media-processing.module.js';
import { QueueModule } from './infrastructure/queue/queue.module.js';
import { RateLimitGuard } from './infrastructure/rate-limit/rate-limit.guard.js';
import { RateLimitModule } from './infrastructure/rate-limit/rate-limit.module.js';
import { StorageModule } from './infrastructure/storage/storage.module.js';

@Module({
  imports: [
    EnvironmentModule,
    LoggerModule,
    LifecycleModule,
    DatabaseModule,
    HealthModule,
    RateLimitModule,
    QueueModule,
    EmailModule,
    StorageModule,
    MediaProcessingModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: RateLimitGuard }],
})
export class AppModule {}
