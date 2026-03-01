import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Tests: Bounded Contexts Documentation (Item #14)
 */
describe('Bounded Contexts Architecture', () => {
  it('BOUNDED_CONTEXTS.md should exist', () => {
    const docPath = path.resolve(__dirname, '../../../docs/BOUNDED_CONTEXTS.md');
    expect(fs.existsSync(docPath)).toBe(true);
  });

  it('should document all core domains', () => {
    const docPath = path.resolve(__dirname, '../../../docs/BOUNDED_CONTEXTS.md');
    const content = fs.readFileSync(docPath, 'utf-8');
    
    const requiredDomains = [
      'Identity',
      'Order',
      'Payment',
      'Reservation',
      'Restaurant',
      'Notification',
    ];
    
    for (const domain of requiredDomains) {
      expect(content.toLowerCase()).toContain(domain.toLowerCase());
    }
  });

  it('should include module dependency diagram', () => {
    const docPath = path.resolve(__dirname, '../../../docs/BOUNDED_CONTEXTS.md');
    const content = fs.readFileSync(docPath, 'utf-8');
    expect(content).toMatch(/mermaid|graph|flowchart|diagram|──|→/i);
  });

  it('should document future evolution strategy', () => {
    const docPath = path.resolve(__dirname, '../../../docs/BOUNDED_CONTEXTS.md');
    const content = fs.readFileSync(docPath, 'utf-8');
    expect(content).toMatch(/microservice|evolution|future|roadmap/i);
  });
});
