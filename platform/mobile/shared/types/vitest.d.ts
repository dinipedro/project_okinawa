/**
 * Vitest compatibility shim
 *
 * The project uses Jest but some test files import from 'vitest'.
 * This declaration re-exports Jest globals so those imports resolve correctly.
 */
declare module 'vitest' {
  export const describe: typeof global.describe;
  export const it: typeof global.it;
  export const expect: typeof global.expect;
  export const beforeEach: typeof global.beforeEach;
  export const afterEach: typeof global.afterEach;
  export const beforeAll: typeof global.beforeAll;
  export const afterAll: typeof global.afterAll;
  export const test: typeof global.it;
  export const vi: typeof jest;
}
