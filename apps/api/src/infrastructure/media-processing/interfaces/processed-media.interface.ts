export interface ProcessedMedia {
  kind: 'IMAGE' | 'PDF';
  body: Buffer;
  mimeType: string;
  extension: 'webp' | 'pdf';
  width?: number;
  height?: number;
  pageCount?: number;
}
