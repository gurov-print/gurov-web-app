import { Module } from '@nestjs/common';
import { EnvironmentModule } from '../../config/environment.module.js';
import { ImageProcessor } from './processors/image.processor.js';
import { PdfProcessor } from './processors/pdf.processor.js';
import { MediaAdmissionService } from './services/media-admission.service.js';

@Module({
  imports: [EnvironmentModule],
  providers: [ImageProcessor, PdfProcessor, MediaAdmissionService],
  exports: [ImageProcessor, PdfProcessor, MediaAdmissionService],
})
export class MediaProcessingModule {}
