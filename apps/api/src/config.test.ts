import { describe, it, expect } from 'vitest';
import { loadConfig } from './config.js';

describe('loadConfig', () => {
  it('parses a valid env object', () => {
    const cfg = loadConfig({
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      PORT: '4000',
      DATABASE_URL: 'postgres://u:p@h:5432/d',
      REDIS_URL: 'redis://h:6379',
    });
    expect(cfg.PORT).toBe(4000);
    expect(cfg.NODE_ENV).toBe('test');
    expect(cfg.LOG_LEVEL).toBe('silent');
  });

  it('rejects a missing DATABASE_URL', () => {
    expect(() =>
      loadConfig({
        NODE_ENV: 'test',
        REDIS_URL: 'redis://h:6379',
      }),
    ).toThrow();
  });

  it('applies defaults for PORT, LOG_LEVEL, NODE_ENV', () => {
    const cfg = loadConfig({
      DATABASE_URL: 'postgres://u:p@h:5432/d',
      REDIS_URL: 'redis://h:6379',
    });
    expect(cfg.PORT).toBe(3000);
    expect(cfg.LOG_LEVEL).toBe('info');
    expect(cfg.NODE_ENV).toBe('development');
  });
});
