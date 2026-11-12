import type { NestNodeApplication } from '@nestjs/platform-node';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { createHttpAdapter } from '../src/config/http-adapter.js';
import { configureHttpApp } from '../src/config/http.config.js';
import { DatabaseService } from '../src/database/database.service.js';
import { RedisThrottlerStorage } from '../src/infrastructure/rate-limit/redis-throttler.storage.js';

describe('Infrastructure HTTP contract', () => {
  let app: NestNodeApplication;
  const database = { checkHealth: vi.fn().mockResolvedValue(undefined) };
  const redis = {
    checkHealth: vi.fn().mockResolvedValue(undefined),
    increment: vi
      .fn()
      .mockResolvedValue({
        totalHits: 1,
        timeToExpire: 60,
        isBlocked: false,
        timeToBlockExpire: 0,
      }),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(DatabaseService)
      .useValue(database)
      .overrideProvider(RedisThrottlerStorage)
      .useValue(redis)
      .compile();
    app = module.createNestApplication<NestNodeApplication>(
      createHttpAdapter(),
      { logger: false },
    );
    configureHttpApp(app);
    await app.init();
  });
  afterAll(async () => {
    await app?.close();
  });

  it('liveness is public, enveloped and independent of dependencies', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/live')
      .expect(200);
    expect(response.body).toEqual({
      status_code: 200,
      detail: { status: 'ok' },
      result: 'success',
    });
    expect(response.headers['x-request-id']).toBeTruthy();
    expect(response.headers['cache-control']).toBe('no-store');
    expect(database.checkHealth).not.toHaveBeenCalled();
    expect(redis.increment).not.toHaveBeenCalled();
  });

  it('readiness reports both dependencies', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200);
    expect(response.body.detail).toEqual({
      status: 'ready',
      checks: { postgresql: 'up', redis: 'up' },
    });
  });

  it('unavailable dependencies return 503 without exposing internal errors', async () => {
    database.checkHealth.mockRejectedValueOnce(
      new Error('private-database-detail'),
    );
    const response = await request(app.getHttpServer())
      .get('/health/ready')
      .expect(503);
    expect(response.body.result).toBe('error');
    expect(response.body.detail.checks.postgresql).toBe('down');
    expect(JSON.stringify(response.body)).not.toContain(
      'private-database-detail',
    );
  });

  it('Swagger contains infrastructure routes without authentication or business routes', async () => {
    const response = await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200);
    expect(response.body.info.title).toBe('Gurov API');
    expect(Object.keys(response.body.paths).sort()).toEqual([
      '/health',
      '/health/live',
      '/health/ready',
    ]);
    expect(response.body.components.securitySchemes ?? {}).toEqual({});
    await request(app.getHttpServer()).post('/auth/login').send({}).expect(404);
  });

  it('CORS accepts the configured frontend origin', async () => {
    const response = await request(app.getHttpServer())
      .options('/health/live')
      .set('Origin', process.env.FRONTEND_ORIGIN!)
      .set('Access-Control-Request-Method', 'GET')
      .expect(204);
    expect(response.headers['access-control-allow-origin']).toBe(
      process.env.FRONTEND_ORIGIN,
    );
  });
});
