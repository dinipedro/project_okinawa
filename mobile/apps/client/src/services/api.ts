/**
 * API Service Re-export
 * 
 * This file re-exports the shared API service to maintain backward compatibility
 * with existing imports. All new code should import directly from:
 * `@/shared/services/api` or `mobile/shared/services/api`
 * 
 * The shared API service provides:
 * - Automatic token refresh with rate limiting
 * - Request queuing during token refresh
 * - Secure storage integration (expo-secure-store)
 * - HTTPS enforcement in production
 * - Comprehensive error logging
 * 
 * @deprecated Import from '@/shared/services/api' instead
 * @module services/api
 */

// Re-export the shared API service for backward compatibility
export { default } from '@/shared/services/api';
export { default as ApiService } from '@/shared/services/api';

// Export API service instance as named export
import SharedApiService from '@/shared/services/api';
export const api = SharedApiService;
