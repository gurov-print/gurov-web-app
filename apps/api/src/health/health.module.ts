import { Module } from '@nestjs/common';

import { EnvironmentModule } from '../config/environment.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { RateLimitStorageModule } from '../infrastructure/rate-limit/rate-limit-storage.module.js';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

@Module({
  imports: [EnvironmentModule, DatabaseModule, RateLimitStorageModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
