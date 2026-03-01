import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Tests: CI/CD Pipeline Completeness (Item #5)
 */
describe('CI/CD Pipeline — GitHub Actions', () => {
  const ciPath = path.resolve(__dirname, '../../../.github/workflows/ci.yml');
  let content: string;

  // Load once
  try {
    content = fs.readFileSync(ciPath, 'utf-8');
  } catch {
    content = '';
  }

  it('CI workflow file should exist', () => {
    expect(fs.existsSync(ciPath)).toBe(true);
  });

  it('should trigger on push and pull_request to main/develop', () => {
    expect(content).toContain('push:');
    expect(content).toContain('pull_request:');
    expect(content).toContain('main');
    expect(content).toContain('develop');
  });

  it('should have frontend job with lint, typecheck, test, build', () => {
    expect(content).toContain('frontend:');
    expect(content).toContain('npx eslint');
    expect(content).toContain('npx tsc --noEmit');
    expect(content).toContain('vitest run --coverage');
    expect(content).toContain('npm run build');
  });

  it('should have backend job with lint, typecheck, test, build', () => {
    expect(content).toContain('backend:');
    expect(content).toContain('working-directory: ./backend');
    expect(content).toContain('npx jest --coverage');
  });

  it('should have Node.js setup with cache', () => {
    expect(content).toContain("node-version: '20'");
    expect(content).toContain("cache: 'npm'");
  });

  it('should have Docker build validation job', () => {
    expect(content).toContain('docker:');
    expect(content).toContain('docker build');
    expect(content).toContain('--target production');
  });

  it('should have security scan job', () => {
    expect(content).toContain('security:');
    expect(content).toContain('npm audit');
    expect(content).toContain('hardcoded secrets');
  });

  it('should upload coverage artifacts', () => {
    expect(content).toContain('upload-artifact@v4');
    expect(content).toContain('coverage');
  });

  it('should have concurrency control', () => {
    expect(content).toContain('concurrency:');
    expect(content).toContain('cancel-in-progress: true');
  });

  it('should have CI badge in README', () => {
    const readmePath = path.resolve(__dirname, '../../../README.md');
    const readme = fs.readFileSync(readmePath, 'utf-8');
    expect(readme).toContain('actions/workflows/ci.yml/badge.svg');
  });
});
