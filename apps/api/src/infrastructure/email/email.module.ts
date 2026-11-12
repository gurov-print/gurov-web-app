import { Module } from '@nestjs/common';

import { EnvironmentModule } from '../../config/environment.module.js';
import { EmailService } from './email.service.js';

@Module({
  imports: [EnvironmentModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
