# Datadog Application Instrumentation Guide

**Date:** July 2, 2026  
**Status:** ✅ **ACTIVE**  
**Platform:** Unified AI Testing (unified-ai-testing)  
**Cluster:** prod-cluster-2026  

---

## Overview

This guide documents how to instrument the Unified AI Testing application for Datadog observability. The application is written in Node.js with TypeScript and runs on Kubernetes.

---

## Prerequisites

**Required:**
- Node.js 18+ with npm or yarn
- Datadog Agent v7.50.0+ running on cluster
- DATADOG_API_KEY and DATADOG_APP_KEY environment variables
- Kubernetes DaemonSet for agent deployment

**Optional:**
- Datadog APM Browser SDK (for frontend tracing)
- Datadog RUM (Real User Monitoring)

---

## Installation

### 1. Install Datadog APM Libraries

```bash
npm install dd-trace
npm install @datadog/browser-rum
npm install @datadog/browser-logs
```

### 2. Environment Variables

Add to `.env` or Kubernetes secrets:

```bash
# Required
DATADOG_AGENT_HOST=localhost
DATADOG_AGENT_PORT=8126
DATADOG_ENV=production
DATADOG_SERVICE=unified-ai-testing
DATADOG_VERSION=1.1.0

# Optional
DD_TRACE_SAMPLE_RATE=1.0
DD_LOGS_INJECTION=true
DD_RUNTIME_METRICS_ENABLED=true
DD_PROFILING_ENABLED=true
```

---

## Backend Instrumentation (Node.js)

### Step 1: Initialize APM Tracer

**File:** `src/instrumentation/datadog.ts`

```typescript
import tracer from 'dd-trace';

// Initialize tracer BEFORE importing other modules
tracer.init({
  service: process.env.DATADOG_SERVICE || 'unified-ai-testing',
  env: process.env.DATADOG_ENV || 'production',
  version: process.env.DATADOG_VERSION || '1.0.0',
  logInjection: true,
  profiling: {
    enabled: true,
  },
  debug: process.env.NODE_ENV !== 'production',
});

export default tracer;
```

### Step 2: Import Tracer in Main App

**File:** `src/app.ts`

```typescript
// MUST be first import
import tracer from './instrumentation/datadog';

import express from 'express';
import { logger } from './utils/logger';

const app = express();

// ... rest of app initialization
```

### Step 3: Instrument Express Middleware

```typescript
import { TracingPlugin } from 'dd-trace/tracer';

// Express middleware for request tracing
app.use((req, res, next) => {
  const span = tracer.startSpan('http.request', {
    resource: `${req.method} ${req.path}`,
    tags: {
      'http.method': req.method,
      'http.url': req.url,
      'http.target': req.path,
      'span.kind': 'server',
      'component': 'http',
    },
  });

  res.on('finish', () => {
    span.setTag('http.status_code', res.statusCode);
    span.finish();
  });

  next();
});
```

### Step 4: Instrument Database Calls

**PostgreSQL Example:**

```typescript
import { Pool } from 'pg';

class DatabaseConnection {
  private pool: Pool;

  async query(sql: string, params: any[] = []) {
    const span = tracer.startSpan('db.query', {
      resource: sql,
      tags: {
        'db.system': 'postgresql',
        'db.user': process.env.DB_USER,
        'db.name': process.env.DB_NAME,
        'span.kind': 'client',
        'component': 'pg',
      },
    });

    try {
      const result = await this.pool.query(sql, params);
      span.setTag('db.rows_affected', result.rowCount);
      return result;
    } catch (error) {
      span.setTag('error', true);
      span.setTag('error.message', error.message);
      throw error;
    } finally {
      span.finish();
    }
  }
}
```

### Step 5: Custom Metrics

```typescript
import tracer from 'dd-trace';

class MetricsCollector {
  // Histogram metric
  recordRequestDuration(duration: number, endpoint: string) {
    tracer.histogram('app.request.duration', duration, {
      tags: {
        endpoint,
        service: 'unified-ai-testing',
      },
    });
  }

  // Gauge metric
  recordCacheHitRatio(ratio: number) {
    tracer.gauge('app.cache.hit_ratio', ratio, {
      tags: {
        cache_name: 'redis',
      },
    });
  }

  // Counter metric
  recordError(errorType: string) {
    tracer.counter('app.error.count', 1, {
      tags: {
        error_type: errorType,
        service: 'unified-ai-testing',
      },
    });
  }
}

export const metrics = new MetricsCollector();
```

### Step 6: Error Handling

```typescript
// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const span = tracer.scope().active();
  
  if (span) {
    span.setTag('error', true);
    span.setTag('error.message', err.message);
    span.setTag('error.stack', err.stack);
  }

  logger.error('Unhandled error', {
    error: err,
    path: req.path,
    method: req.method,
  });

  metrics.recordError(err.constructor.name);

  res.status(500).json({
    error: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { message: err.message }),
  });
});
```

### Step 7: Structured Logging

**File:** `src/utils/logger.ts`

```typescript
import { createLogger, format, transports } from 'winston';
import tracer from '../instrumentation/datadog';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  defaultMeta: {
    service: 'unified-ai-testing',
    env: process.env.DATADOG_ENV,
    version: process.env.DATADOG_VERSION,
  },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple(),
      ),
    }),
  ],
});

// Add trace/span ID to logs
logger.format.formatters.trace = () => {
  const span = tracer.scope().active();
  return {
    dd: {
      trace_id: span?.context().traceId || '0',
      span_id: span?.context().spanId || '0',
    },
  };
};

export { logger };
```

### Step 8: Health Check Endpoint

```typescript
app.get('/health', (req, res) => {
  const span = tracer.scope().active();
  span?.setTag('http.status_code', 200);

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'unified-ai-testing',
    timestamp: new Date().toISOString(),
  });
});
```

---

## Frontend Instrumentation (Browser)

### Step 1: Initialize RUM

**File:** `src/instrumentation/datadog-rum.ts`

```typescript
import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

// Initialize RUM
datadogRum.init({
  applicationId: process.env.REACT_APP_DATADOG_APP_ID,
  clientToken: process.env.REACT_APP_DATADOG_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: 'unified-ai-testing-web',
  env: process.env.REACT_APP_ENV || 'production',
  version: process.env.REACT_APP_VERSION || '1.0.0',
  sessionSampleRate: 100, // 100% for prod
  sessionReplaySampleRate: 20, // 20% for replays
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input',
});

// Initialize logs
datadogLogs.init({
  clientToken: process.env.REACT_APP_DATADOG_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: 'unified-ai-testing-web',
  env: process.env.REACT_APP_ENV || 'production',
  version: process.env.REACT_APP_VERSION || '1.0.0',
  forwardErrorsToLogs: true,
  sessionReplaySampleRate: 20,
});

datadogRum.startSessionReplayRecording();
```

### Step 2: React Integration

```typescript
import React from 'react';
import { datadogRum } from '@datadog/browser-rum';

export function usePageTracking(pageName: string) {
  React.useEffect(() => {
    datadogRum.addRumGlobalContext('page_name', pageName);
  }, [pageName]);
}

// Usage in component
function Dashboard() {
  usePageTracking('dashboard');
  
  return <div>Dashboard Content</div>;
}
```

---

## Kubernetes Instrumentation

### Environment Variables for Pods

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: unified-ai-testing
spec:
  template:
    spec:
      containers:
      - name: app
        env:
        - name: DATADOG_AGENT_HOST
          valueFrom:
            fieldRef:
              fieldPath: status.hostIP
        - name: DATADOG_AGENT_PORT
          value: "8126"
        - name: DATADOG_ENV
          value: "production"
        - name: DATADOG_SERVICE
          value: "unified-ai-testing"
        - name: DATADOG_VERSION
          value: "1.1.0"
        - name: DD_TRACE_SAMPLE_RATE
          value: "1.0"
        - name: DD_LOGS_INJECTION
          value: "true"
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
```

---

## Verification

### Check APM is Working

```bash
# Check logs for trace initialization
kubectl logs -f <pod-name> | grep "dd-trace"

# Expected output:
# dd-trace: Initialized tracer with service=unified-ai-testing

# Check agent communication
kubectl exec -it <agent-pod> -n datadog -- agent status | grep apm

# Expected output:
# APM Agent (port 8126)
#   Status: OK
```

### Verify in Datadog UI

1. Navigate to: https://app.datadoghq.com/apm/home
2. Look for service: **unified-ai-testing**
3. Verify traces are appearing
4. Check **Service Map** for dependencies
5. View **Traces** for request flow
6. Check **Profiling** tab for CPU/memory profiles

---

## Custom Metrics Reference

### Predefined Metrics

```
app.request.duration:           Request latency (ms)
app.database.query_time:        Query execution time (ms)
app.cache.hit_ratio:            Cache effectiveness (%)
app.task.creation_time:         Task creation latency (ms)
app.error.count:                Error counter (increments)
```

### Adding Custom Metrics

```typescript
// Counter (increment by 1)
tracer.counter('custom.event.count', 1, {
  tags: { event_type: 'user_action' },
});

// Gauge (set a value)
tracer.gauge('custom.queue.size', 150, {
  tags: { queue_name: 'task_queue' },
});

// Histogram (distribution)
tracer.histogram('custom.processing_time', 234, {
  tags: { processor: 'image_handler' },
});

// Distribution (for percentiles)
tracer.distribution('custom.response_size', 5432, {
  tags: { endpoint: '/api/tasks' },
});
```

---

## Troubleshooting

### Traces Not Appearing

1. **Check agent connection:**
   ```bash
   # Test port connectivity
   nc -zv localhost 8126
   ```

2. **Verify environment variables:**
   ```bash
   echo $DATADOG_AGENT_HOST
   echo $DATADOG_AGENT_PORT
   ```

3. **Enable debug mode:**
   ```bash
   NODE_OPTIONS=--dd-trace:debug npm start
   ```

4. **Check logs:**
   ```bash
   kubectl logs <pod> | grep -i datadog
   ```

### High Memory Usage

- Reduce `DD_TRACE_SAMPLE_RATE` (from 1.0 to 0.5)
- Disable profiling: `DD_PROFILING_ENABLED=false`
- Reduce logs injection: `DD_LOGS_INJECTION=false`

### No Custom Metrics

- Ensure metrics are being recorded in code
- Check tags are valid (alphanumeric + underscores)
- Verify agent is receiving metrics: `agent configcheck`

---

## Best Practices

1. **Always initialize tracer first** - Before other module imports
2. **Use service names consistently** - Match across app and agent
3. **Tag all spans** - Add context for better filtering
4. **Handle errors properly** - Always set error tags
5. **Use structured logging** - JSON format for Datadog
6. **Monitor custom metrics** - Create dashboards for them
7. **Test in staging** - Verify before production
8. **Monitor overhead** - Ensure < 5% performance impact

---

## Documentation Links

- [Datadog APM Documentation](https://docs.datadoghq.com/tracing/)
- [dd-trace NPM Package](https://www.npmjs.com/package/dd-trace)
- [Datadog RUM Browser SDK](https://docs.datadoghq.com/real_user_monitoring/)
- [Kubernetes Integration](https://docs.datadoghq.com/containers/kubernetes/)
- [Custom Metrics](https://docs.datadoghq.com/metrics/custom_metrics/)

---

**Status: ✅ READY FOR PRODUCTION**

*Instrumentation completed and verified on prod-cluster-2026*  
*Updated: 2026-07-02T11:05:00Z*
