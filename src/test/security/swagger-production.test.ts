import { describe, it, expect } from 'vitest';

/**
 * Security Tests: Swagger Production Protection
 * Validates that Swagger documentation is disabled in production
 * and cannot be accidentally exposed.
 */
describe('Swagger Production Security', () => {
  it('should block Swagger in production via main.ts logic', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const mainPath = path.resolve(__dirname, '../../../backend/src/main.ts');
    const content = fs.readFileSync(mainPath, 'utf-8');

    // Must have production check that blocks swagger
    expect(content).toContain('!isProduction');
    expect(content).toContain('swaggerEnabled');

    // The swaggerEnabled must depend on isProduction being false
    const swaggerLine = content.split('\n').find(line => line.includes('swaggerEnabled'));
    expect(swaggerLine).toBeTruthy();
    expect(swaggerLine).toContain('!isProduction');
  });

  it('should default SWAGGER_ENABLED to false in validation schema', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const validationPath = path.resolve(__dirname, '../../../backend/src/config/validation.config.ts');
    const content = fs.readFileSync(validationPath, 'utf-8');

    // Must default to false (disabled)
    const swaggerLine = content.split('\n').find(line => 
      line.includes('SWAGGER_ENABLED') && line.includes('default')
    );
    expect(swaggerLine).toBeTruthy();
    expect(swaggerLine).toContain("'false'");
  });

  it('should default SWAGGER_ENABLED to false in .env.example', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const envPath = path.resolve(__dirname, '../../../backend/.env.example');
    const content = fs.readFileSync(envPath, 'utf-8');

    const swaggerLine = content.split('\n').find(line => line.startsWith('SWAGGER_ENABLED'));
    expect(swaggerLine).toBeTruthy();
    expect(swaggerLine).toContain('false');
  });

  it('should wrap Swagger setup inside swaggerEnabled conditional', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const mainPath = path.resolve(__dirname, '../../../backend/src/main.ts');
    const content = fs.readFileSync(mainPath, 'utf-8');

    // SwaggerModule.setup must be inside if (swaggerEnabled) block
    expect(content).toContain('if (swaggerEnabled)');
    expect(content).toContain('SwaggerModule.setup');
    
    // Ensure SwaggerModule.setup comes AFTER the if check
    const ifIndex = content.indexOf('if (swaggerEnabled)');
    const setupIndex = content.indexOf('SwaggerModule.setup');
    expect(setupIndex).toBeGreaterThan(ifIndex);
  });
});
