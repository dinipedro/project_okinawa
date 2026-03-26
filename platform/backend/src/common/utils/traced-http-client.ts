import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';

export interface TracedAxiosOptions {
  /** Trace ID to propagate. If omitted, a new UUID is generated. */
  traceId?: string;
  /** Request ID to propagate. If omitted, uses the traceId value. */
  requestId?: string;
  /** Base timeout in milliseconds (default: 15000). */
  timeout?: number;
}

/**
 * Create an axios instance that automatically attaches
 * `X-Trace-ID` and `X-Request-ID` headers to every outgoing request.
 *
 * Usage:
 * ```ts
 * const http = createTracedAxios({ traceId: req.traceId });
 * await http.post('https://api.example.com/v1/resource', body);
 * ```
 */
export function createTracedAxios(options: TracedAxiosOptions = {}): AxiosInstance {
  const traceId = options.traceId || uuidv4();
  const requestId = options.requestId || traceId;
  const timeout = options.timeout ?? 15_000;

  const instance = axios.create({ timeout });

  instance.interceptors.request.use((config) => {
    config.headers = config.headers || {};
    config.headers['X-Trace-ID'] = traceId;
    config.headers['X-Request-ID'] = requestId;
    return config;
  });

  return instance;
}
