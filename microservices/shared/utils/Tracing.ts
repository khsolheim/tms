import { v4 as uuidv4 } from 'uuid';

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  baggage?: Record<string, string>;
}

export interface SpanData {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags: Record<string, any>;
  logs: Array<{
    timestamp: number;
    fields: Record<string, any>;
  }>;
  status: 'ok' | 'error' | 'timeout';
}

export class Span {
  private data: SpanData;
  private finished: boolean = false;

  constructor(
    operationName: string,
    traceContext?: TraceContext
  ) {
    this.data = {
      traceId: traceContext?.traceId || uuidv4(),
      spanId: uuidv4(),
      parentSpanId: traceContext?.spanId,
      operationName,
      startTime: Date.now(),
      tags: {},
      logs: [],
      status: 'ok'
    };
  }

  setTag(key: string, value: any): Span {
    this.data.tags[key] = value;
    return this;
  }

  setTags(tags: Record<string, any>): Span {
    Object.assign(this.data.tags, tags);
    return this;
  }

  log(fields: Record<string, any>): Span {
    this.data.logs.push({
      timestamp: Date.now(),
      fields
    });
    return this;
  }

  setStatus(status: 'ok' | 'error' | 'timeout'): Span {
    this.data.status = status;
    return this;
  }

  finish(): void {
    if (this.finished) return;
    
    this.data.endTime = Date.now();
    this.data.duration = this.data.endTime - this.data.startTime;
    this.finished = true;
    
    // Send to Jaeger collector
    tracer.reportSpan(this.data);
  }

  getContext(): TraceContext {
    return {
      traceId: this.data.traceId,
      spanId: this.data.spanId,
      parentSpanId: this.data.parentSpanId
    };
  }

  getData(): SpanData {
    return { ...this.data };
  }
}

export class Tracer {
  private serviceName: string;
  private spans: Map<string, SpanData> = new Map();
  private jaegerEndpoint: string;

  constructor(serviceName: string, jaegerEndpoint?: string) {
    this.serviceName = serviceName;
    this.jaegerEndpoint = jaegerEndpoint || process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces';
  }

  startSpan(operationName: string, parentContext?: TraceContext): Span {
    const span = new Span(operationName, parentContext);
    
    span.setTags({
      'service.name': this.serviceName,
      'service.version': process.env.SERVICE_VERSION || '1.0.0',
      'span.kind': 'server'
    });

    return span;
  }

  startChildSpan(operationName: string, parentSpan: Span): Span {
    return this.startSpan(operationName, parentSpan.getContext());
  }

  async reportSpan(spanData: SpanData): Promise<void> {
    try {
      this.spans.set(spanData.spanId, spanData);
      
      // In a real implementation, you would send this to Jaeger
      // For now, we'll just log it
      console.log(`[TRACE] ${this.serviceName}:${spanData.operationName}`, {
        traceId: spanData.traceId,
        spanId: spanData.spanId,
        duration: spanData.duration,
        status: spanData.status,
        tags: spanData.tags
      });

      // Simulate sending to Jaeger (in production, use jaeger-client)
      if (process.env.NODE_ENV !== 'test') {
        // await this.sendToJaeger(spanData);
      }
    } catch (error) {
      console.error('Failed to report span:', error);
    }
  }

  private async sendToJaeger(spanData: SpanData): Promise<void> {
    // Convert to Jaeger format
    const jaegerSpan = {
      traceID: spanData.traceId,
      spanID: spanData.spanId,
      parentSpanID: spanData.parentSpanId,
      operationName: spanData.operationName,
      startTime: spanData.startTime * 1000, // Jaeger expects microseconds
      duration: (spanData.duration || 0) * 1000,
      tags: Object.entries(spanData.tags).map(([key, value]) => ({
        key,
        type: typeof value === 'string' ? 'string' : 'number',
        value: String(value)
      })),
      logs: spanData.logs.map(log => ({
        timestamp: log.timestamp * 1000,
        fields: Object.entries(log.fields).map(([key, value]) => ({
          key,
          value: String(value)
        }))
      })),
      process: {
        serviceName: this.serviceName,
        tags: [
          { key: 'hostname', value: process.env.HOSTNAME || 'localhost' },
          { key: 'version', value: process.env.SERVICE_VERSION || '1.0.0' }
        ]
      }
    };

    // Send to Jaeger (implement HTTP client call)
    // await fetch(this.jaegerEndpoint, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ spans: [jaegerSpan] })
    // });
  }

  getSpans(): SpanData[] {
    return Array.from(this.spans.values());
  }

  clear(): void {
    this.spans.clear();
  }
}

// Global tracer instance
export const tracer = new Tracer(process.env.SERVICE_NAME || 'unknown-service');

// Express middleware for automatic tracing
export const tracingMiddleware = (serviceName?: string) => {
  return (req: any, res: any, next: any) => {
    const traceId = req.headers['x-trace-id'] || uuidv4();
    const parentSpanId = req.headers['x-parent-span-id'];
    
    const span = tracer.startSpan(`${req.method} ${req.path}`, {
      traceId,
      spanId: parentSpanId || uuidv4()
    });

    span.setTags({
      'http.method': req.method,
      'http.url': req.originalUrl,
      'http.user_agent': req.headers['user-agent'],
      'user.id': req.user?.id,
      'company.id': req.user?.bedriftId
    });

    // Add trace context to request
    req.traceContext = span.getContext();
    req.span = span;

    // Add trace headers to response
    res.setHeader('x-trace-id', traceId);
    res.setHeader('x-span-id', span.getContext().spanId);

    // Finish span when response ends
    res.on('finish', () => {
      span.setTags({
        'http.status_code': res.statusCode,
        'http.response_size': res.get('content-length') || 0
      });

      if (res.statusCode >= 400) {
        span.setStatus('error');
        span.log({
          level: 'error',
          message: `HTTP ${res.statusCode}`,
          'http.status_code': res.statusCode
        });
      }

      span.finish();
    });

    next();
  };
};

// Utility function to trace async operations
export async function traceAsync<T>(
  operationName: string,
  operation: (span: Span) => Promise<T>,
  parentContext?: TraceContext
): Promise<T> {
  const span = tracer.startSpan(operationName, parentContext);
  
  try {
    const result = await operation(span);
    span.setStatus('ok');
    return result;
  } catch (error) {
    span.setStatus('error');
    span.log({
      level: 'error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  } finally {
    span.finish();
  }
}

// Utility function to trace database operations
export async function traceDatabase<T>(
  query: string,
  operation: () => Promise<T>,
  parentContext?: TraceContext
): Promise<T> {
  return traceAsync(
    'database.query',
    async (span) => {
      span.setTags({
        'db.type': 'postgresql',
        'db.statement': query.substring(0, 100), // Truncate long queries
        'component': 'prisma'
      });
      
      return await operation();
    },
    parentContext
  );
} 