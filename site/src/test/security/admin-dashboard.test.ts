import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Tests: Admin Dashboard (Item #13)
 */
describe('Admin Dashboard', () => {
  it('admin page should exist', () => {
    const adminPath = path.resolve(__dirname, '../../../src/pages/AdminDashboard.tsx');
    expect(fs.existsSync(adminPath)).toBe(true);
  });

  it('admin page should have authentication check', () => {
    const adminPath = path.resolve(__dirname, '../../../src/pages/AdminDashboard.tsx');
    const content = fs.readFileSync(adminPath, 'utf-8');
    // Should check authentication
    expect(content).toMatch(/isAuthenticated|authenticated|login|password/i);
  });

  it('admin page should display user metrics', () => {
    const adminPath = path.resolve(__dirname, '../../../src/pages/AdminDashboard.tsx');
    const content = fs.readFileSync(adminPath, 'utf-8');
    expect(content).toMatch(/users|Users|Usuários/i);
    expect(content).toMatch(/metrics|Metrics|Métricas/i);
  });

  it('admin route should be registered in App.tsx', () => {
    const appPath = path.resolve(__dirname, '../../../src/App.tsx');
    const content = fs.readFileSync(appPath, 'utf-8');
    expect(content).toContain('/admin');
    expect(content).toContain('AdminDashboard');
  });
});
