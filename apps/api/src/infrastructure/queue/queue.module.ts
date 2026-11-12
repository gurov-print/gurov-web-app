import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { EnvironmentModule } from '../../config/environment.module.js';
import { EnvironmentService } from '../../config/environment.service.js';
import { LifecycleModule } from '../lifecycle/lifecycle.module.js';
import { QueueService } from './queue.service.js';

@Module({
  imports: [
    EnvironmentModule,
    LifecycleModule,
    BullModule.forRootAsync({
      imports: [EnvironmentModule],
      inject: [EnvironmentService],
      useFactory: (environmentService: EnvironmentService) => ({
        prefix: environmentService.redisQueuePrefix,
        connection: {
          host: environmentService.redisHost,
          port: environmentService.redisPort,
        },
      }),
    }),
    // Register worker queues in their future feature modules. Producers are lazy.
  ],
  providers: [QueueService],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
