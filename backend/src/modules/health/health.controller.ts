import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '@/common/decorators/public.decorator';

/** Maximum heap memory in bytes (500MB) */
const MAX_HEAP_MEMORY_BYTES = 500 * 1024 * 1024;
/** Maximum RSS memory in bytes (1GB) */
const MAX_RSS_MEMORY_BYTES = 1024 * 1024 * 1024;
/** Minimum free disk space threshold (10%) */
const MIN_DISK_SPACE_PERCENT = 0.1;

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Check application health status' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  @ApiResponse({ status: 503, description: 'Application is unhealthy' })
  async check() {
    return this.health.check([
      // Database health check
      () => this.db.pingCheck('database'),

      // Memory health check (heap should be less than 500MB)
      () => this.memory.checkHeap('memory_heap', MAX_HEAP_MEMORY_BYTES),

      // RSS memory should be less than 1GB
      () => this.memory.checkRSS('memory_rss', MAX_RSS_MEMORY_BYTES),

      // Disk health (at least 10% free space)
      () =>
        this.disk.checkStorage('disk', {
          path: '/',
          thresholdPercent: MIN_DISK_SPACE_PERCENT,
        }),
    ]);
  }

  @Get('live')
  @Public()
  @ApiOperation({ summary: 'Kubernetes liveness probe' })
  @ApiResponse({ status: 200, description: 'Application is live' })
  async liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Kubernetes readiness probe' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  async readiness() {
    return this.health.check([
      // Only check database for readiness
      () => this.db.pingCheck('database'),
    ]);
  }
}
