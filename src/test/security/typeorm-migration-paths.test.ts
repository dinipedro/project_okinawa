import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Tests: TypeORM Migration Path Configuration (Item #6)
 */
describe('TypeORM Migration Paths', () => {
  const configPath = path.resolve(__dirname, '../../../backend/src/config/typeorm.config.ts');
  let content: string;

  try {
    content = fs.readFileSync(configPath, 'utf-8');
  } catch {
    content = '';
  }

  it('should use resolveGlob function for entity and migration paths', () => {
    expect(content).toContain('resolveGlob');
    // Both typeOrmConfig and dataSourceOptions should use resolveGlob
    const resolveGlobCalls = content.match(/resolveGlob\(/g);
    expect(resolveGlobCalls).toBeTruthy();
    expect(resolveGlobCalls!.length).toBeGreaterThanOrEqual(4); // 2 in config + 2 in DataSource
  });

  it('resolveGlob should be defined BEFORE typeOrmConfig', () => {
    const resolveGlobIndex = content.indexOf('const resolveGlob');
    const typeOrmConfigIndex = content.indexOf('export const typeOrmConfig');
    expect(resolveGlobIndex).toBeLessThan(typeOrmConfigIndex);
  });

  it('should detect compiled JS vs dev TS environment', () => {
    expect(content).toContain("__filename.endsWith('.js')");
  });

  it('should use .js only for compiled, .ts,.js for dev', () => {
    expect(content).toContain("*{.js}");
    expect(content).toContain("*{.ts,.js}");
  });

  it('should NOT have hardcoded {.ts,.js} paths outside resolveGlob', () => {
    // Remove the resolveGlob function body to check the rest
    const withoutResolveGlob = content.replace(
      /const resolveGlob[\s\S]*?};/m,
      ''
    );
    // The remaining code should not have raw glob patterns for entities/migrations
    expect(withoutResolveGlob).not.toMatch(/entities.*\{\.ts,\.js\}/);
    expect(withoutResolveGlob).not.toMatch(/migrations.*\{\.ts,\.js\}/);
  });

  it('should validate required DB env vars with fail-fast', () => {
    expect(content).toContain("throw new Error");
    expect(content).toContain("DATABASE_HOST");
    expect(content).toContain("DATABASE_USER");
    expect(content).toContain("DATABASE_PASSWORD");
    expect(content).toContain("DATABASE_NAME");
  });

  it('CI pipeline should have migration verification step', () => {
    const ciPath = path.resolve(__dirname, '../../../.github/workflows/ci.yml');
    const ciContent = fs.readFileSync(ciPath, 'utf-8');
    expect(ciContent).toContain('Verify migrations resolve in dist');
    expect(ciContent).toContain('entity.js');
    expect(ciContent).toContain('typeorm.config.js');
  });
});
