import { Module } from '@nestjs/common';

import { EnvironmentModule } from '../../config/environment.module.js';
import { LifecycleModule } from '../lifecycle/lifecycle.module.js';
import { LocalStorageAdapter } from './adapters/local-storage.adapter.js';
import { S3StorageAdapter } from './adapters/s3-storage.adapter.js';
import { StorageService } from './storage.service.js';
@Module({
  imports: [EnvironmentModule, LifecycleModule],
  providers: [LocalStorageAdapter, S3StorageAdapter, StorageService],
  exports: [StorageService],
})
export class StorageModule {}
