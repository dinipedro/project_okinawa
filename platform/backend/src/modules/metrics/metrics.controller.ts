import { Controller, Get, Header, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProduces } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { MetricsService } from './metrics.service';

/**
 * MetricsController - Exposes Prometheus-compatible metrics endpoint.
 *
 * GET /metrics returns all collected metrics in Prometheus text exposition format.
 * The endpoint is public (no authentication required) so that Prometheus scrapers
 * can collect data without needing credentials.
 *
 * Controlled by METRICS_ENABLED env var:
 * - In production: only enabled when METRICS_ENABLED=true
 * - In non-production: enabled by default unless METRICS_ENABLED=false
 */
@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  @ApiProduces('text/plain')
  @ApiResponse({
    status: 200,
    description: 'Prometheus text exposition format metrics',
  })
  @ApiResponse({
    status: 403,
    description: 'Metrics endpoint is disabled',
  })
  getMetrics(): string {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const isProduction = nodeEnv === 'production';
    const metricsEnabled = process.env.METRICS_ENABLED;

    // In production, only serve if explicitly enabled
    // In non-production, serve unless explicitly disabled
    const shouldServe = isProduction
      ? metricsEnabled === 'true'
      : metricsEnabled !== 'false';

    if (!shouldServe) {
      return '# Metrics endpoint is disabled\n';
    }

    return this.metricsService.getMetrics();
  }
}
