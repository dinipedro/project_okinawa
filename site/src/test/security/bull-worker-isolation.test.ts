import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Tests: Bull Worker Process Isolation (Item #11)
 */
describe('Bull Worker Process Isolation', () => {
  const backendSrc = path.resolve(__dirname, '../../../backend/src');

  it('worker.ts entrypoint should exist', () => {
    expect(fs.existsSync(path.join(backendSrc, 'worker.ts'))).toBe(true);
  });

  it('worker.module.ts should exist', () => {
    expect(fs.existsSync(path.join(backendSrc, 'worker.module.ts'))).toBe(true);
  });

  it('worker.ts should NOT expose HTTP endpoints', () => {
    const content = fs.readFileSync(path.join(backendSrc, 'worker.ts'), 'utf-8');
    expect(content).toContain('createApplicationContext');
    expect(content).not.toContain('app.listen');
    expect(content).not.toContain('NestFactory.create(');
  });

  it('worker.ts should have graceful shutdown', () => {
    const content = fs.readFileSync(path.join(backendSrc, 'worker.ts'), 'utf-8');
    expect(content).toContain('SIGTERM');
    expect(content).toContain('SIGINT');
    expect(content).toContain('enableShutdownHooks');
  });

  it('worker.ts should write healthcheck file', () => {
    const content = fs.readFileSync(path.join(backendSrc, 'worker.ts'), 'utf-8');
    expect(content).toContain('worker-healthy');
    expect(content).toContain('writeFileSync');
  });

  it('worker.module.ts should only import queue-processing modules', () => {
    const content = fs.readFileSync(path.join(backendSrc, 'worker.module.ts'), 'utf-8');
    // Should have Bull
    expect(content).toContain('BullModule');
    // Should NOT have HTTP-only modules
    expect(content).not.toContain('AuthModule');
    expect(content).not.toContain('OrdersModule');
    expect(content).not.toContain('PaymentsModule');
    expect(content).not.toContain('WebhooksModule');
  });

  it('docker-compose should have worker service', () => {
    const dockerPath = path.resolve(__dirname, '../../../docker-compose.yml');
    const content = fs.readFileSync(dockerPath, 'utf-8');
    expect(content).toContain('worker');
    expect(content).toContain('worker-healthy');
  });

  it('worker service should depend on redis and postgres', () => {
    const dockerPath = path.resolve(__dirname, '../../../docker-compose.yml');
    const content = fs.readFileSync(dockerPath, 'utf-8');
    // Find worker section
    const workerSection = content.slice(content.indexOf('worker'));
    expect(workerSection).toContain('postgres');
    expect(workerSection).toContain('redis');
  });
});
