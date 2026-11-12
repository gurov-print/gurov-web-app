import { describe, expect, it } from 'vitest';
import { validateEnvironment } from './environment.validation.js';
import { parseTrustedProxies } from './proxy.config.js';

describe('Environment configuration', () => {
  it('starts without authentication secrets or business-model configuration', () => {
    const input = { ...process.env };
    for (const key of Object.keys(input)) {
      if (/^(ACCESS_|JWT_|INVITATION_|SESSION_|PASSWORD_RESET_)/.test(key))
        delete input[key];
    }
    const environment = validateEnvironment(input);
    expect(environment.APP_PORT).toBe(3000);
    expect(environment.REDIS_QUEUE_PREFIX).toBe('gurov');
    expect('ACCESS_JWT_SECRET' in environment).toBe(false);
  });

  it('rejects invalid ports and incomplete SMTP credential pairs', () => {
    expect(() => validateEnvironment({ ...process.env, APP_PORT: 0 })).toThrow(
      /APP_PORT/,
    );
    expect(() =>
      validateEnvironment({
        ...process.env,
        SMTP_USER: 'only-user',
        SMTP_PASSWORD: '',
      }),
    ).toThrow(/SMTP_PASSWORD/);
  });

  it('permits explicit proxy networks but rejects trusting all clients', () => {
    expect(parseTrustedProxies('127.0.0.1,10.0.0.0/8')).toEqual([
      '127.0.0.1',
      '10.0.0.0/8',
    ]);
    expect(() => parseTrustedProxies('0.0.0.0/0')).toThrow();
  });
});
