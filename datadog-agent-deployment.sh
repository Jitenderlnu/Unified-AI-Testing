#!/bin/bash

###############################################################################
# Datadog Agent Deployment Script for Kubernetes
# Purpose: Deploy and configure Datadog monitoring on prod-cluster-2026
# Status: READY FOR PRODUCTION
# Date: 2026-07-02
###############################################################################

set -euo pipefail

# Configuration
DATADOG_NAMESPACE="datadog"
DATADOG_RELEASE="datadog"
CHART_REPO="datadog"
CHART_NAME="datadog/datadog"
CLUSTER_NAME="prod-cluster-2026"
REGION="us-east-1"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

###############################################################################
# FUNCTIONS
###############################################################################

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl not found. Please install kubectl."
        exit 1
    fi

    if ! command -v helm &> /dev/null; then
        log_error "helm not found. Please install helm."
        exit 1
    fi

    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster."
        exit 1
    fi

    log_info "kubectl: $(kubectl version --short)"
    log_info "helm: $(helm version --short)"
    log_info "Cluster: $(kubectl config current-context)"
}

create_namespace() {
    log_info "Creating Datadog namespace..."

    if kubectl get namespace "$DATADOG_NAMESPACE" &> /dev/null; then
        log_warn "Namespace '$DATADOG_NAMESPACE' already exists"
    else
        kubectl create namespace "$DATADOG_NAMESPACE"
        log_info "Namespace created: $DATADOG_NAMESPACE"
    fi
}

create_secrets() {
    log_info "Creating Datadog secrets..."

    if [ -z "${DATADOG_API_KEY:-}" ]; then
        log_error "DATADOG_API_KEY environment variable not set"
        exit 1
    fi

    if [ -z "${DATADOG_APP_KEY:-}" ]; then
        log_error "DATADOG_APP_KEY environment variable not set"
        exit 1
    fi

    # Check if secret already exists
    if kubectl get secret datadog-secret -n "$DATADOG_NAMESPACE" &> /dev/null; then
        log_warn "Secret 'datadog-secret' already exists. Skipping creation."
        return
    fi

    kubectl create secret generic datadog-secret \
        --from-literal=api-key="$DATADOG_API_KEY" \
        --from-literal=app-key="$DATADOG_APP_KEY" \
        -n "$DATADOG_NAMESPACE"

    log_info "Secrets created successfully"
}

add_helm_repo() {
    log_info "Adding Datadog Helm repository..."

    helm repo add datadog https://helm.datadoghq.com || log_warn "Repository already exists"
    helm repo update

    log_info "Helm repository updated"
}

create_values_file() {
    log_info "Creating Datadog Helm values file..."

    cat > datadog-values.yaml << 'EOF'
# Datadog Helm Chart Values
# Generated for prod-cluster-2026

datadog:
  apiKey: ${DATADOG_API_KEY}
  appKey: ${DATADOG_APP_KEY}
  site: datadoghq.com
  env: production
  clusterName: prod-cluster-2026

# Agent Configuration
agents:
  enabled: true
  image:
    tag: 7.50.0
  rbac:
    enabled: true
  priorityClassName: ""
  tolerations:
    - effect: NoSchedule
      key: node-role.kubernetes.io/master
      operator: Exists
    - effect: NoSchedule
      key: node-role.kubernetes.io/control-plane
      operator: Exists

# Cluster Agent
clusterAgent:
  enabled: true
  rbac:
    enabled: true
  metricsProvider:
    enabled: true

# APM Configuration
apm:
  enabled: true
  port: 8126
  env: production
  service: unified-ai-testing

# Log Collection
logs:
  enabled: true
  containerCollectAll: true
  containerCollectUsingFiles: true

# Process Monitoring
process:
  enabled: true
  processCollectionEnabled: true

# System Monitoring
systemProbe:
  enabled: true
  debugPort: 0

# Kubernetes State Metrics
kubeStateMetrics:
  enabled: true

# Event Collection
kubeApiserverMetrics:
  enabled: true

# Network Policy
networkPolicy:
  enabled: false

# Resource Limits
agents:
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi

# Node Agent Configuration
env:
  - name: DD_COLLECT_KUBERNETES_EVENTS
    value: "true"
  - name: DD_LEADER_ELECTION
    value: "true"
  - name: DD_ENABLE_METADATA_COLLECTION
    value: "true"
EOF

    log_info "Values file created: datadog-values.yaml"
}

deploy_datadog() {
    log_info "Deploying Datadog Agent..."

    helm upgrade --install "$DATADOG_RELEASE" "$CHART_NAME" \
        --namespace "$DATADOG_NAMESPACE" \
        --values datadog-values.yaml \
        --set datadog.apiKey="$DATADOG_API_KEY" \
        --set datadog.appKey="$DATADOG_APP_KEY" \
        --wait \
        --timeout 10m

    log_info "Datadog Agent deployed successfully"
}

verify_deployment() {
    log_info "Verifying deployment..."

    log_info "Waiting for pods to be ready..."
    sleep 10

    # Check DaemonSet
    log_info "Checking DaemonSet..."
    kubectl get daemonset -n "$DATADOG_NAMESPACE"

    # Check pods
    log_info "Checking pods..."
    kubectl get pods -n "$DATADOG_NAMESPACE"

    # Wait for pods to be ready
    kubectl wait --for=condition=ready pod \
        -l app=datadog-agent \
        -n "$DATADOG_NAMESPACE" \
        --timeout=300s || log_warn "Some pods not ready yet"

    log_info "Deployment verification complete"
}

check_agent_health() {
    log_info "Checking agent health..."

    AGENT_POD=$(kubectl get pods -n "$DATADOG_NAMESPACE" -l app=datadog-agent -o name | head -1)

    if [ -z "$AGENT_POD" ]; then
        log_error "No agent pods found"
        return 1
    fi

    log_info "Checking agent status in pod: $AGENT_POD"

    # Get agent status
    kubectl exec -it "$AGENT_POD" -n "$DATADOG_NAMESPACE" -- agent status || \
        log_warn "Could not fetch agent status"
}

configure_alerts() {
    log_info "Configuring alert rules..."

    # This would typically be done via Datadog API or UI
    # For now, we'll log the configuration

    cat > datadog-alerts.json << 'EOF'
{
  "alert_rules": [
    {
      "name": "Error Rate Spike",
      "type": "metric",
      "query": "avg(last_5m):sum:trace.web.request.errors{env:prod} > 2",
      "severity": "critical",
      "notification_channels": ["slack_critical", "pagerduty"]
    },
    {
      "name": "High API Latency",
      "type": "metric",
      "query": "avg(last_5m):p95:trace.web.request.duration{env:prod} > 300",
      "severity": "high",
      "notification_channels": ["slack_alerts"]
    },
    {
      "name": "High CPU Utilization",
      "type": "metric",
      "query": "avg(last_5m):avg:system.cpu.user{env:prod} > 85",
      "severity": "high",
      "notification_channels": ["slack_alerts"]
    }
  ]
}
EOF

    log_info "Alert configuration saved to: datadog-alerts.json"
    log_warn "Alert rules need to be created via Datadog UI or API"
}

create_dashboards() {
    log_info "Creating dashboards..."

    cat > datadog-dashboards.json << 'EOF'
{
  "dashboards": [
    {
      "name": "Production Overview",
      "widgets": [
        {
          "type": "timeseries",
          "title": "Request Rate",
          "query": "sum:trace.web.request.hits{env:prod}"
        },
        {
          "type": "timeseries",
          "title": "Error Rate",
          "query": "sum:trace.web.request.errors{env:prod}"
        },
        {
          "type": "gauge",
          "title": "CPU Usage",
          "query": "avg:system.cpu.user{env:prod}"
        },
        {
          "type": "gauge",
          "title": "Memory Usage",
          "query": "avg:system.mem.pct_usable{env:prod}"
        }
      ]
    }
  ]
}
EOF

    log_info "Dashboard configuration saved to: datadog-dashboards.json"
    log_warn "Dashboards need to be created via Datadog UI or API"
}

print_summary() {
    echo ""
    log_info "=========================================="
    log_info "Datadog Deployment Summary"
    log_info "=========================================="
    log_info "Namespace: $DATADOG_NAMESPACE"
    log_info "Cluster: $CLUSTER_NAME"
    log_info "Region: $REGION"
    log_info "Release: $DATADOG_RELEASE"
    log_info ""
    log_info "✅ Datadog Agent deployed successfully!"
    log_info ""
    log_info "Next steps:"
    log_info "1. Verify pods are running: kubectl get pods -n $DATADOG_NAMESPACE"
    log_info "2. Check agent logs: kubectl logs -n $DATADOG_NAMESPACE -l app=datadog-agent"
    log_info "3. Access Datadog UI: https://app.datadoghq.com"
    log_info "4. Create alert rules in Datadog UI"
    log_info "5. Create dashboards in Datadog UI"
    log_info ""
    log_info "Documentation: https://docs.datadoghq.com"
    log_info "=========================================="
    echo ""
}

###############################################################################
# MAIN EXECUTION
###############################################################################

main() {
    log_info "Starting Datadog Agent deployment for $CLUSTER_NAME..."
    echo ""

    check_prerequisites
    create_namespace
    create_secrets
    add_helm_repo
    create_values_file
    deploy_datadog
    verify_deployment
    check_agent_health
    configure_alerts
    create_dashboards
    print_summary

    log_info "Deployment complete!"
    exit 0
}

# Run main function
main "$@"
