import { Module, Global, DynamicModule } from '@nestjs/common';
import { TracingService } from './tracing.service';

export interface TracingModuleOptions {
  serviceName: string;
  enabled?: boolean;
  samplingRate?: number;
  exporterEndpoint?: string;
}

@Global()
@Module({})
export class TracingModule {
  static forRoot(options: TracingModuleOptions): DynamicModule {
    return {
      module: TracingModule,
      providers: [
        {
          provide: 'TRACING_OPTIONS',
          useValue: options,
        },
        TracingService,
      ],
      exports: [TracingService],
    };
  }
}
