import { describe, it, expect } from 'vitest';

/**
 * Security Tests: Docker Compose Secret Hardcoding
 * Validates that no docker-compose file contains hardcoded secrets
 * and all use ${VAR:?error} pattern for required variables.
 */
describe('Docker Compose Secret Security', () => {
  const dockerFiles = [
    { name: 'root docker-compose.yml', path: '../../../docker-compose.yml' },
    { name: 'backend docker-compose.yml', path: '../../../backend/docker-compose.yml' },
  ];

  const dangerousPatterns = [
    /PASSWORD[=:]\s*(?!.*\$\{)[a-zA-Z0-9_]+/i,
    /JWT_SECRET[=:]\s*(?!.*\$\{)['"]?[a-zA-Z-]+/i,
  ];

  const hardcodedSecrets = [
    'okinawa_dev_password',
    'okinawa_redis_password',
    'your-jwt-secret',
    'your-super-secret',
    'csrf-secret-key',
  ];

  for (const file of dockerFiles) {
    describe(file.name, () => {
      it('should not contain any hardcoded secret values', async () => {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.resolve(__dirname, file.path);
        const content = fs.readFileSync(filePath, 'utf-8');

        for (const secret of hardcodedSecrets) {
          expect(content).not.toContain(secret);
        }
      });

      it('should use ${VAR:?error} pattern for required secrets', async () => {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.resolve(__dirname, file.path);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Check that DATABASE_PASSWORD uses :? pattern
        if (content.includes('DATABASE_PASSWORD')) {
          const dbPassLines = content.split('\n').filter(l => 
            l.includes('DATABASE_PASSWORD') && !l.trim().startsWith('#')
          );
          for (const line of dbPassLines) {
            if (line.includes('${')) {
              expect(line).toMatch(/\$\{DATABASE_PASSWORD:\?/);
            }
          }
        }

        // Check JWT_SECRET uses :? pattern
        if (content.includes('JWT_SECRET')) {
          const jwtLines = content.split('\n').filter(l => 
            l.includes('JWT_SECRET') && l.includes('${') && !l.trim().startsWith('#')
          );
          for (const line of jwtLines) {
            expect(line).toMatch(/\$\{JWT_SECRET:\?/);
          }
        }
      });
    });
  }

  it('should not have hardcoded pgAdmin password "admin"', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    for (const file of dockerFiles) {
      const filePath = path.resolve(__dirname, file.path);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // pgAdmin password should not be plain "admin" or "admin123"
      const pgAdminLines = content.split('\n').filter(l => l.includes('PGADMIN_DEFAULT_PASSWORD'));
      for (const line of pgAdminLines) {
        expect(line).not.toMatch(/:\s*admin\s*$/);
        expect(line).not.toContain('admin123');
      }
    }
  });
});
