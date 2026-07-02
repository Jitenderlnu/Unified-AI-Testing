# Site Reliability Engineer - Datadog Observability Deployment Guide

**Deployment Date:** July 2, 2026, 11:05:00 UTC  
**Status:** ✅ **DEPLOYED & ACTIVE**  
**Platform:** Datadog (Primary Observability Platform)  

---

## Deployment Overview

This guide documents the complete Datadog observability stack deployed to production cluster `prod-cluster-2026`.

### What's Deployed

✅ **Datadog Agent** (v7.50.0)
- Kubernetes DaemonSet on all 5 nodes
- APM/tracing enabled
- Metrics collection active
- Log aggregation enabled

✅ **Custom Metrics** (5 configured)
- Request duration tracking
- Database query monitoring
- Cache hit ratio measurement
- Task creation performance
- Error counting

✅ **Health Checks** (6 active)
- Application health endpoint
- API readiness checks
- Database connectivity
- Cache (Redis) health
- DNS resolution
- SSL certificate expiry monitoring

✅ **Alert Rules** (10 configured)
- Error rate spike detection
- High latency alerts
- Database performance monitoring
- CPU/memory utilization
- Service downtime alerts
- Security alerts (auth failures)

✅ **Dashboards** (4 created)
- Production Overview
- Error Analysis
- Performance Metrics
- Infrastructure Health

---

## Installation Steps

### Step 1: Add Datadog Helm Repository

```bash
helm repo add datadog https://helm.datadoghq.com
helm repo update
```

### Step 2: Create Datadog Namespace

```bash
kubectl create namespace datadog
```

### Step 3: Create Secrets for Datadog Credentials

```bash
kubectl create secret generic datadog-secret \
  --from-literal=api-key=$DATADOG_API_KEY \
  --from-literal=app-key=$DATADOG_APP_KEY \
  -n datadog
```

### Step 4: Deploy Datadog Agent using Helm

```bash
helm install datadog datadog/datadog \
  --namespace datadog \
  --values datadog-values.yaml
```

### Step 5: Verify Deployment

```bash
# Check DaemonSet
kubectl get daemonset -n datadog

# Check pods running
kubectl get pods -n datadog

# Check agent status
kubectl logs -n datadog -l app=datadog-agent --tail=50
```

---

## Configuration Files

### Datadog Values (YAML)

**File:** `datadog-values.yaml`

```yaml
datadog:
  apiKey: ${DATADOG_API_KEY}
  appKey: ${DATADOG_APP_KEY}
  site: datadoghq.com
  env: production
  clusterName: prod-cluster-2026

agents:
  enabled: true
  rbac:
    enabled: true
  tolerations:
    - effect: NoSchedule
      key: node-role.kubernetes.io/master
      operator: Exists
      
clusterAgent:
  enabled: true
  rbac:
    enabled: true
    
apm:
  enabled: true
  port: 8126
  env: production
  service: unified-ai-testing
  
logs:
  enabled: true
  containerCollectAll: true
  containerCollectUsingFiles: true
  
process:
  enabled: true
  processCollectionEnabled: true

kubeStateMetrics:
  enabled: true
```

---

## Health Checks Configuration

### Health Check Details

#### 1. Application Health (CRITICAL)
```
URL: https://prod.unified-ai-testing.com/health
Method: GET
Expected Status: 200
Interval: 30 seconds
Alert Threshold: 1 consecutive failure
```

#### 2. API Readiness (CRITICAL)
```
URL: https://prod.unified-ai-testing.com/api/health
Method: GET
Expected Status: 200
Interval: 30 seconds
Alert Threshold: 1 consecutive failure
```

#### 3. Database Connectivity (CRITICAL)
```
Host: staging-db-4521.c9akciq32.us-east-1.rds.amazonaws.com
Port: 5432
Interval: 30 seconds
Alert Threshold: 2 consecutive failures
```

#### 4. Cache Health (HIGH)
```
Host: redis-prod.us-east-1.elasticache.amazonaws.com
Port: 6379
Interval: 30 seconds
Alert Threshold: 3 consecutive failures
```

#### 5. DNS Resolution (LOW)
```
Hostname: prod.unified-ai-testing.com
Interval: 60 seconds
Alert Threshold: 5 consecutive failures
```

#### 6. SSL Certificate Expiry (HIGH)
```
Endpoint: https://prod.unified-ai-testing.com
Warning: 30 days before expiry
Critical: 7 days before expiry
Interval: Daily
```

---

## Error Catching Configuration

### Error Types Being Tracked

```
ApplicationError:
  └─ Alert Threshold: 10 errors in 5 minutes
  └─ Severity: HIGH
  └─ Action: Investigate immediately

DatabaseError:
  └─ Alert Threshold: 5 errors in 5 minutes
  └─ Severity: CRITICAL
  └─ Action: Page on-call SRE

ValidationError:
  └─ Alert Threshold: 50 errors in 5 minutes
  └─ Severity: LOW
  └─ Action: Monitor and log

AuthenticationError:
  └─ Alert Threshold: 20 errors in 5 minutes
  └─ Severity: HIGH
  └─ Action: Investigate security

TimeoutError:
  └─ Alert Threshold: 5 errors in 5 minutes
  └─ Severity: HIGH
  └─ Action: Investigate performance

RateLimitError:
  └─ Alert Threshold: 100 errors in 5 minutes
  └─ Severity: MEDIUM
  └─ Action: Analyze traffic patterns
```

### Stack Trace Capture

✅ Enabled for all errors
✅ Context information captured
✅ User information captured (PII redacted)
✅ Request/response metadata included
✅ 90-day retention

---

## Custom Alert Thresholds

### Critical Alerts

**1. Error Rate Spike**
- Threshold: > 2% error rate
- Duration: 5 minutes
- Action: Page on-call SRE immediately

**2. Service Down**
- Threshold: Service unavailable (0 up)
- Duration: 30 seconds
- Action: Page on-call SRE immediately
- Escalation: VP Engineering if not acknowledged

**3. Disk Space Critical**
- Threshold: > 90% disk usage
- Duration: 1 minute
- Action: Immediate remediation required

### High Priority Alerts

**1. High API Latency**
- Threshold: p95 latency > 300ms
- Duration: 5 minutes
- Action: Investigate performance bottleneck

**2. Database Query Slow**
- Threshold: p95 query time > 100ms
- Duration: 5 minutes
- Action: Investigate query optimization

**3. High CPU Utilization**
- Threshold: > 85% CPU
- Duration: 5 minutes
- Action: Scale or investigate root cause

**4. High Memory Utilization**
- Threshold: < 15% available memory
- Duration: 5 minutes
- Action: Scale or investigate memory leak

### Medium Priority Alerts

**1. Authentication Failures Spike**
- Threshold: > 20 failures in 5 minutes
- Action: Investigate security incident

**2. Rate Limit Exceeded**
- Threshold: > 100 rate limit errors in 5 minutes
- Action: Analyze traffic patterns

**3. SSL Certificate Expiring**
- Threshold: < 30 days until expiry
- Action: Renew certificate
- Escalation: 7 days = critical

---

## Notification Channels

### Slack Integration

**Critical Alerts:** `#production-critical`
- Mentioned: @on-call-sre
- Immediate notification
- Requires acknowledgment

**High/Medium Alerts:** `#production-alerts`
- Mentioned: @sre-team
- Real-time notification
- For investigation

### PagerDuty Integration

**Critical Alerts Only**
- Severity: SEV-1
- Auto-creation of incidents
- Escalation policy active
- 15-minute escalation timeout

### Email Notifications

**Recipients:** sre-team@company.com
- Critical severity alerts
- High severity alerts (summary hourly)
- Daily digest of all incidents

---

## Dashboards

### 1. Production Overview Dashboard

**Widgets:**
- Request rate (req/sec) - timeseries
- Error rate (percent) - timeseries
- CPU usage (percent) - gauge
- Memory usage (percent) - gauge
- API latency p95 (ms) - timeseries
- Database query time (ms) - area chart

**Refresh Rate:** 30 seconds  
**Time Range:** Last 1 hour (adjustable)  

### 2. Error Analysis Dashboard

**Widgets:**
- Top 10 errors - table
- Error distribution over time - heatmap
- Recently seen errors - table
- Error trends by type - timeseries
- Error stack traces - searchable

**Refresh Rate:** 15 seconds  
**Purpose:** Root cause analysis  

### 3. Performance Metrics Dashboard

**Widgets:**
- Response time distribution - stacked area
- Latency by endpoint - heatmap
- Database connection pool - timeseries
- Cache hit ratio - timeseries
- Request throughput - gauge

**Refresh Rate:** 30 seconds  
**Purpose:** Performance trending  

### 4. Infrastructure Health Dashboard

**Widgets:**
- CPU by node - timeseries
- Memory by node - timeseries
- Disk I/O - timeseries
- Network throughput - timeseries
- Pod restarts - counter
- Node availability - gauge

**Refresh Rate:** 1 minute  
**Purpose:** Infrastructure troubleshooting  

---

## Integrations

### AWS Integration

**Status:** ✅ Active

**Monitored Services:**
- EC2 instances (5 nodes)
- RDS (PostgreSQL database)
- ALB (load balancer)
- S3 (backups)
- CloudWatch (logs)

**IAM Role:** `DatadogIntegrationRole`  
**Metrics Collected:** CloudWatch metrics  
**Logs Forwarding:** Enabled  

### Kubernetes Integration

**Status:** ✅ Active

**Monitoring:**
- Container metrics (CPU, memory, I/O)
- Pod metrics (status, restarts)
- Node metrics (health, capacity)
- Kubernetes events
- Deployment health

### PostgreSQL Integration

**Status:** ✅ Active

**Metrics:**
- Query performance
- Connection pooling
- Transaction metrics
- Replication metrics
- Index usage

### Redis Integration

**Status:** ✅ Active

**Metrics:**
- Cache hit ratio
- Memory usage
- Operations per second
- Connected clients
- Key evictions

---

## Log Collection

### Log Pipelines

**1. Application Logs**
- Filter: source:unified-ai-testing
- Processors: Service remapper, environment remapper
- Retention: 90 days
- Storage: Datadog

**2. Error Logs**
- Filter: source:unified-ai-testing AND level:ERROR
- Processors: Error message mapping, stack trace mapping
- Retention: 90 days (archived to S3)
- Storage: Datadog + S3 (cold storage)

**3. Database Logs**
- Filter: source:postgresql
- Processors: Service remapping
- Retention: 30 days
- Storage: Datadog

**4. Request Logs**
- Filter: source:unified-ai-testing AND service:api
- Processors: Request ID mapping, response time mapping
- Retention: 90 days
- Storage: Datadog

---

## Synthetic Monitoring

### Browser Tests

**Login Flow Test**
- Runs: Every 5 minutes
- Steps: Navigate → Login → Dashboard verification
- Locations: US-East-1
- Expected completion: < 5 seconds
- Alert: Failure on 2 consecutive runs

### API Tests

**Health Endpoint Test**
- Runs: Every 1 minute
- Method: GET /api/health
- Expected: 200 status code
- Locations: US-East-1
- Alert: Failure on 3 consecutive runs

---

## Incident Management

### Auto-Incident Creation

✅ Enabled for critical alerts

**Severity Mapping:**
- Critical → SEV-1
- High → SEV-2
- Medium → SEV-3
- Low → SEV-4

### Post-Mortem Automation

✅ Automatic timeline generation  
✅ Incident correlation  
✅ Impact analysis  

---

## Cost Optimization

### Retention Policies

```
Logs:       90 days (hot) + S3 archive
Metrics:    400 days
Traces:     15 days
Profiles:   7 days
```

### Sampling Rates

```
Logs:       100% (full capture for prod)
Traces:     100% (full APM tracing)
APM:        100% (comprehensive coverage)
```

---

## Compliance & Security

### Security Measures

✅ PII Redaction: Enabled
✅ Audit Logging: All access logged
✅ Encryption: TLS in transit, AES at rest
✅ Data Residency: US-East-1

### Compliance Standards

✅ SOC2 Type II
✅ GDPR Compliant
✅ HIPAA Ready

### Data Retention

```
Default:    90 days hot storage
Archive:    S3 for long-term retention
Deletion:   Automatic after retention period
```

---

## Monitoring Dashboard Access

### Public Dashboards

- **Production Overview:** https://datadoghq.com/dashboard/prod_overview
- **Error Analysis:** https://datadoghq.com/dashboard/prod_errors
- **Performance:** https://datadoghq.com/dashboard/prod_performance
- **Infrastructure:** https://datadoghq.com/dashboard/prod_infrastructure

### Access Control

- SRE Team: Full access
- Engineering: Read-only
- Product: Read-only (no sensitive data)
- Executive: High-level summary only

---

## Troubleshooting

### Agent Not Reporting

```bash
# Check agent status
kubectl logs -n datadog -l app=datadog-agent

# Check agent health
kubectl exec -it -n datadog <agent-pod> -- agent status

# Restart agent
kubectl rollout restart daemonset/datadog-agent -n datadog
```

### Metrics Not Appearing

1. Check agent is collecting: `agent status`
2. Verify APM port: Port 8126 is open
3. Check integrations: `agent configcheck`
4. Restart if needed: `agent restart`

### Alerts Not Firing

1. Verify alert rule is enabled
2. Check notification channel configuration
3. Test alert with manual trigger
4. Check PagerDuty integration status

---

## Support & Escalation

**Level 1 Support:** SRE Team  
**Level 2 Support:** Engineering Lead  
**Level 3 Support:** VP Engineering  

**Critical Issues:** Page on-call SRE via PagerDuty  
**Non-Critical:** Create incident and assign to team  

---

**Status: ✅ DEPLOYED & OPERATIONAL**

*Prepared by: Site Reliability Engineering Team*  
*Last Updated: 2026-07-02T11:05:00Z*
