import 'reflect-metadata';
import { resolve } from 'node:path';
import { config } from 'dotenv';

// Only disposable example settings; tests never load credentials from another project.
config({
  path: resolve(import.meta.dirname, '../../../.env.example'),
  quiet: true,
});
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
