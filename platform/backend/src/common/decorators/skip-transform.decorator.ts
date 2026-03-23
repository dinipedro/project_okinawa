import { SetMetadata } from '@nestjs/common';
import { SKIP_TRANSFORM_KEY } from '../interceptors/transform-response.interceptor';

/**
 * Decorator to skip response transformation for specific endpoints
 * Useful for endpoints that return non-standard formats (files, streams, etc.)
 */
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);
