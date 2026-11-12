const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
require('reflect-metadata');
require('./load-env.cjs');

const { Test } = require('@nestjs/testing');
const { sql } = require('@gurov/database');
const { Queue } = require('bullmq');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const request = require('supertest');
const { until } = require('./helpers/until.cjs');

void test(
  'compiled infrastructure works with PostgreSQL, Redis and local files',
  { timeout: 20000 },
  async (t) => {
    for (const key of ['POSTGRES_HOST', 'REDIS_HOST']) {
      assert(
        ['localhost', '127.0.0.1', '::1'].includes(process.env[key]),
        'Local test services only',
      );
    }
    const storageRoot = await mkdtemp(
      path.join(tmpdir(), 'gurov-storage-test-'),
    );
    process.env.STORAGE_LOCAL_ROOT = storageRoot;
    process.env.REDIS_QUEUE_PREFIX = `gurov_test_${randomUUID().replaceAll('-', '')}`;
    t.after(() => rm(storageRoot, { recursive: true, force: true }));

    const { AppModule } = require('../dist/app.module.js');
    const { createHttpAdapter } = require('../dist/config/http-adapter.js');
    const { configureHttpApp } = require('../dist/config/http.config.js');
    const { DatabaseService } = require('../dist/database/database.service.js');
    const {
      QueueService,
    } = require('../dist/infrastructure/queue/queue.service.js');
    const {
      RedisThrottlerStorage,
    } = require('../dist/infrastructure/rate-limit/redis-throttler.storage.js');
    const {
      StorageService,
    } = require('../dist/infrastructure/storage/storage.service.js');
    const {
      ImageProcessor,
    } = require('../dist/infrastructure/media-processing/processors/image.processor.js');
    const {
      PdfProcessor,
    } = require('../dist/infrastructure/media-processing/processors/pdf.processor.js');

    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = module.createNestApplication(createHttpAdapter(), {
      logger: false,
    });
    t.after(() => app.close());
    configureHttpApp(app);
    await app.listen(0, '127.0.0.1');
    const http = request(app.getHttpServer());
    await until(async () => {
      try {
        await app.get(RedisThrottlerStorage).checkHealth();
        return true;
      } catch {
        return false;
      }
    });

    await t.test(
      'real dependency probes are ready and schema exports contain no tables',
      async () => {
        const response = await http.get('/health/ready').expect(200);
        assert.deepEqual(response.body.detail, {
          status: 'ready',
          checks: { postgresql: 'up', redis: 'up' },
        });
        const result = await app
          .get(DatabaseService)
          .db.execute(sql`select 1 as value`);
        assert.equal(result.rows[0].value, 1);
        assert.deepEqual(Object.keys(require('@gurov/database/schema')), []);
      },
    );

    await t.test(
      'a generic job is persisted without authentication processors',
      async () => {
        const queue = new Queue('email', {
          prefix: process.env.REDIS_QUEUE_PREFIX,
          connection: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
          },
        });
        try {
          const jobId = randomUUID();
          await app
            .get(QueueService)
            .enqueue(
              'email',
              'infrastructure-probe',
              { value: 'test' },
              { jobId },
            );
          const job = await queue.getJob(jobId);
          assert.deepEqual(job.data, { value: 'test' });
          assert.equal(job.opts.attempts, 5);
          await queue.obliterate({ force: true });
        } finally {
          await queue.close();
        }
      },
    );

    await t.test('image processing and local storage round trip', async () => {
      const input = await sharp({
        create: { width: 2, height: 2, channels: 3, background: '#ffffff' },
      })
        .png()
        .toBuffer();
      const processed = await app.get(ImageProcessor).process(input);
      assert.equal(processed.mimeType, 'image/webp');
      const key = `images/${randomUUID()}.webp`;
      const storage = app.get(StorageService);
      await storage.put('local', key, processed.body, processed.mimeType);
      const chunks = [];
      for await (const chunk of await storage.read('local', key))
        chunks.push(chunk);
      assert.deepEqual(Buffer.concat(chunks), processed.body);
      await storage.delete('local', key);
      await assert.rejects(storage.read('local', key));
      await assert.rejects(
        storage.put('local', '../escape.webp', input, 'image/webp'),
      );
    });

    await t.test('PDF validation worker runs from the ESM build', async () => {
      const document = await PDFDocument.create();
      document.addPage();
      const processed = await app
        .get(PdfProcessor)
        .process(Buffer.from(await document.save()));
      assert.equal(processed.pageCount, 1);
      assert.equal(processed.mimeType, 'application/pdf');
      await assert.rejects(
        app.get(PdfProcessor).process(Buffer.from('not a PDF')),
      );
    });
  },
);
