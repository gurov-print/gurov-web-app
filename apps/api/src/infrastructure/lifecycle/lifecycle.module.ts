import { Global, Module } from '@nestjs/common';

import { EnvironmentModule } from '../../config/environment.module.js';
import { LifecycleService } from './lifecycle.service.js';

@Global()
@Module({
  imports: [EnvironmentModule],
  providers: [LifecycleService],
  exports: [LifecycleService],
})
export class LifecycleModule {}
