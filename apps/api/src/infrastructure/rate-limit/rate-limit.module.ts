import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

import { RateLimitStorageModule } from './rate-limit-storage.module.js';
import { RedisThrottlerStorage } from './redis-throttler.storage.js';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [RateLimitStorageModule],
      inject: [RedisThrottlerStorage],
      useFactory: (storage: RedisThrottlerStorage) => ({
        storage,
        throttlers: [{ ttl: 60000, limit: 60 }],
        ipv6SubnetPrefix: 64,
      }),
    }),
  ],
  exports: [ThrottlerModule],
})
export class RateLimitModule {}
