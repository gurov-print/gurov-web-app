import { Module } from '@nestjs/common';

import { EnvironmentModule } from '../../config/environment.module.js';
import { RedisThrottlerStorage } from './redis-throttler.storage.js';

@Module({
  imports: [EnvironmentModule],
  providers: [RedisThrottlerStorage],
  exports: [RedisThrottlerStorage],
})
export class RateLimitStorageModule {}
