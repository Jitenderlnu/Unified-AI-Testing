# Configuration & Routing System

## Executive Summary

This document describes the **Configuration Management & Dynamic Routing System** for the Unified AI Testing project. The system enables:

- 🎯 **Centralized Configuration**: Single `configuration.json` file as source of truth
- 🔀 **Dynamic Routing**: Automatic path resolution for inputs/outputs across 5 execution phases
- 🔐 **Credential Management**: Secure handling of JIRA, GitHub, and DataDog credentials
- 🚀 **Feature Flags**: Control integration enablement dynamically
- 📊 **Tech Stack Awareness**: Automatically routes based on frontend/backend/database selection
- 🔗 **Multi-Integration Support**: JIRA, GitHub, DataDog, Stitch pre-integrated

---

## Files Overview

### Core Configuration
| File | Purpose |
|------|---------|
| `configuration.json` | Main configuration file with all paths, credentials, integrations |
| `config.manager.js` | Parses and validates configuration, builds runtime config |
| `routing.orchestrator.js` | Manages dynamic routing of inputs/outputs by execution phase |
| `.env.example` | Environment variables template (create `.env` from this) |

### Documentation & Examples
| File | Purpose |
|------|---------|
| `CONFIG_USAGE_GUIDE.md` | Comprehensive usage guide with code examples |
| `CONFIGURATION_README.md` | This file - system overview |
| `example.usage.js` | Full workflow example across all 5 phases |

### Security
| File | Purpose |
|------|---------|
| `.gitignore` | Prevents committing sensitive files |
| `secrets.md` | Guidelines for managing credentials (not in repo) |

---

## Configuration Structure

### 1. Project Metadata
```json
{
  "projectMetadata": {
    "projectName": "UnifiedAITesting",
    "businessCaseFile": "C://Users//jitender.lnu//Desktop//UnifiedAITesting//Task Management.pdf"
  }
}
```

**Used for:**
- Project identification
- Business case reference
- Documentation generation

---

### 2. Paths Configuration
```json
{
  "paths": {
    "output": "C://Users//jitender.lnu//Desktop//UnifiedAITesting//output",
    "documents": "C://Users//jitender.lnu//Desktop//UnifiedAITesting//documents",
    "testResults": "C://Users//jitender.lnu//Desktop//UnifiedAITesting//test_results",
    "architecture": "C://Users//jitender.lnu//Desktop//UnifiedAITesting//architecture",
    "wireframes": "C://Users//jitender.lnu//Desktop//UnifiedAITesting//wireframes",
    "backups": "C://Users//jitender.lnu//Desktop//UnifiedAITesting//backups"
  }
}
```

**Used for:**
- Input/output routing
- File storage locations
- Automatic directory creation

---

### 3. JIRA Configuration
```json
{
  "jira": {
    "isNewJIRA": true,
    "hostURL": "https://jitenderlnu.atlassian.net/",
    "projectKey": "UN",
    "boardID": 596,
    "apiToken": "ATATT3xFfGF0...",
    "userEmail": "jitender.lnu@telusdigital.com"
  }
}
```

**Used for:**
- Issue tracking integration
- Workflow automation
- Sprint management
- API endpoint construction: `hostURL + rest/api/3/`

---

### 4. GitHub Configuration
```json
{
  "versionControl": {
    "isNewRepository": true,
    "provider": "Github",
    "repositoryURL": "https://github.com/Jitenderlnu/Unified-AI-Testing",
    "branchStrategy": "trunk-based",
    "mainBranch": "main",
    "personalAccessToken": "ghp_kmp8v4TENQrHCN...",
    "cicdTemplate": "github-actions"
  }
}
```

**Used for:**
- Repository operations
- Branch management
- CI/CD pipeline setup
- Automated deployments

---

### 5. Design System (Stitch)
```json
{
  "design": {
    "stitchProjectName": "UnifiedAITesting",
    "stitchWorkspaceID": "9911504790861479393"
  }
}
```

**Used for:**
- UI/UX design system
- Design token management
- Figma integration

---

### 6. Technology Stack
```json
{
  "techStack": {
    "frontend": "React",
    "backend": "Node.js",
    "database": "SqlLite",
    "orm": "Prisma"
  }
}
```

**Used for:**
- Technology selection
- Code generation
- Dependency management
- Testing framework selection

---

### 7. Observability
```json
{
  "observability": {
    "provider": "DataDog",
    "apiKey": "ddapp_zdVoCWxJanIqitWcCTTDSfjOlKqS1nyNRx"
  }
}
```

**Used for:**
- Monitoring & logging
- APM integration
- Metrics collection
- Alert management

---

### 8. Quality & Security
```json
{
  "quality": {
    "testingFramework": "jest",
    "sastTool": "ESLint"
  }
}
```

**Used for:**
- Test execution
- Code quality analysis
- Security scanning
- Coverage reporting

---

## Execution Phases & Output Routing

The system supports **5 execution phases**, each with specific output routing:

### Phase 1: Planning
```
Input:  businessCase.pdf
Output: documents/
├── project-plan.json
├── risk-assessment.json
└── requirements.json
```

**Focus:** Requirements, risk assessment, project planning

### Phase 2: Design
```
Output: architecture/
├── api-schema.json
├── database-schema.json
└── design-specs.json
```

**Focus:** API design, database schema, architecture specifications

### Phase 3: Development
```
Output: output/
├── frontend/
├── backend/
├── migrations/
└── config files
```

**Focus:** Code generation, configuration, project structure

### Phase 4: Testing
```
Output: test_results/
├── test-results.json
├── coverage-report.json
└── performance-metrics.json
```

**Focus:** Test execution, coverage analysis, performance testing

### Phase 5: Deployment
```
Output: documents/ + backups/
├── deployment-guide.json
├── operational-checklist.json
└── backup-data/
```

**Focus:** Deployment procedures, operational guides, backups

---

## Runtime Configuration Mapping

The system builds a runtime configuration object that maps all properties:

```javascript
runtimeConfig = {
  projectName: "UnifiedAITesting",
  businessCaseFile: "...",
  paths: { ... },
  jira: { 
    enabled: true,
    hostURL: "...",
    apiEndpoint: "https://jitenderlnu.atlassian.net/rest/api/3/",
    ...
  },
  github: { 
    enabled: true,
    repositoryURL: "...",
    ...
  },
  design: { ... },
  techStack: { ... },
  observability: { ... },
  quality: { ... }
}
```

---

## Routing Configuration Mapping

The system builds a routing configuration for dynamic input/output routing:

```javascript
routingConfig = {
  inputRouting: {
    businessCase: { path: "...", format: "pdf", routing: "documentation" },
    specifications: { path: "...", format: "json|pdf|md", routing: "documentation" },
    architecture: { path: "...", format: "drawio|svg|json", routing: "design" },
    wireframes: { path: "...", format: "figma|svg|png", routing: "design" }
  },
  
  outputRouting: {
    planning: { projectPlan, riskAssessment, requirements },
    design: { designSpecs, apiSchemas, databaseSchema },
    development: { sourceCode, configFiles, documentation },
    testing: { testResults, coverageReports, performanceMetrics },
    deployment: { deploymentGuide, backupData, operationalLogs }
  },
  
  credentials: {
    jira: { type, endpoint, token, email, project },
    github: { type, repository, token, branch },
    observability: { type, provider, apiKey }
  },
  
  techStackRouting: {
    frontend: { stack, outputPath, testPath },
    backend: { stack, outputPath, testPath },
    database: { type, orm, schemaPath, migrationsPath }
  },
  
  featureFlags: {
    enableJIRA: true,
    enableGitHub: true,
    useNewJIRA: true,
    useNewRepository: true,
    cicdEnabled: true,
    observabilityEnabled: true
  }
}
```

---

## Integration Patterns

### JIRA Integration
```javascript
// Get credentials
const jiraConfig = orchestrator.getJIRACredentials();

// API calls to JIRA
fetch(`${jiraConfig.apiEndpoint}issues`, {
  headers: {
    'Authorization': `Bearer ${jiraConfig.token}`
  }
});
```

### GitHub Integration
```javascript
// Get credentials
const githubConfig = orchestrator.getGitHubCredentials();

// Git operations with authentication
git push origin ${githubConfig.branch}
```

### DataDog Integration
```javascript
// Get credentials
const ddConfig = orchestrator.getObservabilityCredentials();

// Send metrics
dd-trace.init({ apiKey: ddConfig.apiKey });
```

---

## Quick Start

### 1. Load Configuration
```javascript
const RoutingOrchestrator = require('./routing.orchestrator');
const orchestrator = new RoutingOrchestrator('./configuration.json');
```

### 2. Set Execution Phase
```javascript
orchestrator.setExecutionPhase('development');
```

### 3. Get Output Path
```javascript
const outputPath = orchestrator.resolveOutputPath('sourceCode');
```

### 4. Save Output
```javascript
orchestrator.saveJSONOutput(data, 'output.json', 'sourceCode');
```

### 5. Get Credentials
```javascript
const jiraConfig = orchestrator.getJIRACredentials();
const githubConfig = orchestrator.getGitHubCredentials();
```

---

## Security Practices

### ✅ DO:
- [ ] Store `configuration.json` in `.gitignore`
- [ ] Use environment variables for sensitive data
- [ ] Rotate API tokens regularly
- [ ] Limit token permissions to minimum required
- [ ] Audit credential usage
- [ ] Encrypt credentials at rest

### ❌ DON'T:
- [ ] Commit credentials to version control
- [ ] Share tokens via email or chat
- [ ] Use same token across environments
- [ ] Store credentials in code comments
- [ ] Log full credentials
- [ ] Use default/test tokens in production

---

## Environment Variables

Create `.env` file (based on `.env.example`):

```bash
# JIRA
JIRA_HOST_URL=https://jitenderlnu.atlassian.net/
JIRA_API_TOKEN=***
JIRA_USER_EMAIL=jitender.lnu@telusdigital.com

# GitHub
GITHUB_PAT=***
GITHUB_REPO_URL=https://github.com/Jitenderlnu/Unified-AI-Testing

# DataDog
DATADOG_API_KEY=***

# Database
DATABASE_URL=file:./dev.db

# Application
NODE_ENV=development
PORT=3000
```

### Load in Code
```javascript
require('dotenv').config();

const config = {
  jira: {
    apiToken: process.env.JIRA_API_TOKEN,
    hostURL: process.env.JIRA_HOST_URL
  },
  github: {
    pat: process.env.GITHUB_PAT
  }
};
```

---

## Command Line Usage

### Run Configuration Manager
```bash
node config.manager.js
```

Output:
- Parsed runtime configuration
- Routing configuration
- Configuration summary
- Validation results

### Run Routing Orchestrator
```bash
node routing.orchestrator.js
```

Output:
- Routing summary
- Execution context
- Tech stack routing
- Feature flags
- Path validation

### Run Example Workflow
```bash
node example.usage.js
```

Output:
- Complete 5-phase execution
- Generated artifacts for each phase
- Execution summary
- Success metrics

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ENOENT: configuration.json not found` | Ensure file exists in root directory |
| `JSON Parse error` | Validate JSON syntax with `node -e "JSON.parse(fs.readFileSync(...))"`  |
| `Path does not exist` | Orchestrator creates paths automatically; check permissions |
| `Credentials not found` | Verify credentials are set in configuration.json or environment |
| `Invalid execution phase` | Use one of: planning, design, development, testing, deployment |

---

## Advanced Usage

### Custom Phase
```javascript
orchestrator.setExecutionPhase('planning');
const customPath = path.join(
  orchestrator.runtimeConfig.paths.output,
  'custom-phase'
);
```

### Conditional Routing
```javascript
if (orchestrator.isFeatureEnabled('enableJIRA')) {
  // Use JIRA
  const jiraConfig = orchestrator.getJIRACredentials();
}
```

### Execution Context
```javascript
const context = orchestrator.getExecutionContext();
// Access: context.phase, context.credentials, context.techStack
```

---

## Validation Checklist

Before production deployment:

- [ ] All paths in `configuration.json` are valid
- [ ] All credentials are set and valid
- [ ] `.gitignore` includes `configuration.json`
- [ ] Environment variables are configured
- [ ] API tokens are rotated
- [ ] Feature flags are appropriate for environment
- [ ] Tech stack matches project requirements
- [ ] Integration endpoints are verified
- [ ] Backup paths are writable
- [ ] Output directories have sufficient permissions

---

## Summary

The configuration system provides:

| Feature | Benefit |
|---------|---------|
| Centralized config | Single source of truth |
| Dynamic routing | Automatic path resolution |
| Phase-aware output | Organized artifacts |
| Credential management | Secure handling of secrets |
| Feature flags | Flexible integration control |
| Tech stack routing | Automatic tool selection |
| Extensible design | Easy to add new integrations |

**All paths, credentials, and routes are determined by `configuration.json`**, enabling complete portability and reproducibility across environments.

---

## Next Steps

1. **Review** `CONFIG_USAGE_GUIDE.md` for detailed examples
2. **Run** `node example.usage.js` to see full workflow
3. **Integrate** `RoutingOrchestrator` into your application
4. **Customize** paths and integrations as needed
5. **Secure** credentials with `.env` and `.gitignore`

For questions or issues, refer to CONFIG_USAGE_GUIDE.md or examine the source code in `config.manager.js` and `routing.orchestrator.js`.
