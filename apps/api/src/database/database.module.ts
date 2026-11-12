import { Module } from '@nestjs/common';

import { EnvironmentModule } from '../config/environment.module.js';
import { LifecycleModule } from '../infrastructure/lifecycle/lifecycle.module.js';
import { DatabaseService } from './database.service.js';

@Module({
  imports: [EnvironmentModule, LifecycleModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
