import { describe, it, expect } from 'vitest';

/**
 * Security Tests: AppModule Integrity
 * Validates that AppModule has no duplicated exports
 * and maintains correct structure.
 */
describe('AppModule Integrity', () => {
  it('should have exactly one export of AppModule', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const appModulePath = path.resolve(__dirname, '../../../backend/src/app.module.ts');
    const content = fs.readFileSync(appModulePath, 'utf-8');

    const exportMatches = content.match(/export class AppModule/g);
    expect(exportMatches).toHaveLength(1);
  });

  it('should have proper @Module decorator', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const appModulePath = path.resolve(__dirname, '../../../backend/src/app.module.ts');
    const content = fs.readFileSync(appModulePath, 'utf-8');

    expect(content).toContain('@Module({');
    expect(content).toContain('imports:');
  });

  it('should import AppModule correctly in main.ts', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const mainPath = path.resolve(__dirname, '../../../backend/src/main.ts');
    const content = fs.readFileSync(mainPath, 'utf-8');

    expect(content).toContain("import { AppModule } from './app.module'");
    expect(content).toContain('NestFactory.create(AppModule');
  });
});
