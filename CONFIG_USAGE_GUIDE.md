# Configuration & Routing Guide

## Overview

The configuration management system provides dynamic input/output routing across all execution phases. This guide explains how to use the ConfigurationManager and RoutingOrchestrator to route data throughout the project lifecycle.

---

## Architecture

### Components

1. **ConfigurationManager** (`config.manager.js`)
   - Parses `configuration.json`
   - Builds runtime configuration
   - Validates configuration integrity
   - Provides section-specific access

2. **RoutingOrchestrator** (`routing.orchestrator.js`)
   - Manages dynamic path routing
   - Handles credentials securely
   - Controls execution phases
   - Ensures directory creation

3. **configuration.json**
   - Single source of truth for all project configuration
   - Contains paths, credentials, tech stack, integrations

---

## Configuration Structure

### Project Metadata
```json
{
  "projectMetadata": {
    "projectName": "UnifiedAITesting",
    "businessCaseFile": "C://Users//jitender.lnu//Desktop//UnifiedAITesting//Task Management.pdf"
  }
}
```

### Paths
All input/output directories:
```json
{
  "paths": {
    "output": "...",
    "documents": "...",
    "testResults": "...",
    "architecture": "...",
    "wireframes": "...",
    "backups": "..."
  }
}
```

### JIRA Configuration
```json
{
  "jira": {
    "isNewJIRA": true,
    "hostURL": "https://jitenderlnu.atlassian.net/",
    "projectKey": "UN",
    "boardID": 596,
    "apiToken": "***",
    "userEmail": "jitender.lnu@telusdigital.com"
  }
}
```

### GitHub Configuration
```json
{
  "versionControl": {
    "isNewRepository": true,
    "provider": "Github",
    "repositoryURL": "https://github.com/Jitenderlnu/Unified-AI-Testing",
    "branchStrategy": "trunk-based",
    "mainBranch": "main",
    "personalAccessToken": "***",
    "cicdTemplate": "github-actions"
  }
}
```

### Tech Stack
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

---

## Usage Examples

### 1. Initialize Configuration Manager

```javascript
const ConfigurationManager = require('./config.manager');

const configManager = new ConfigurationManager('./configuration.json');
configManager.loadConfiguration();
configManager.validate();

const config = configManager.buildRuntimeConfiguration();
const routing = configManager.buildRoutingConfiguration();
```

### 2. Use Routing Orchestrator in Your Code

```javascript
const RoutingOrchestrator = require('./routing.orchestrator');

const orchestrator = new RoutingOrchestrator('./configuration.json');

// Set execution phase (planning, design, development, testing, deployment)
orchestrator.setExecutionPhase('development');

// Get output path for current phase
const outputPath = orchestrator.resolveOutputPath('sourceCode');

// Save generated files
orchestrator.saveJSONOutput(apiSchema, 'api-schema.json', 'sourceCode');

// Get JIRA credentials for integration
const jiraConfig = orchestrator.getJIRACredentials();

// Get GitHub credentials for repository operations
const githubConfig = orchestrator.getGitHubCredentials();

// Get execution context
const context = orchestrator.getExecutionContext();
```

### 3. Access Specific Configuration Sections

```javascript
// Get all paths
const paths = configManager.getSection('paths');

// Get JIRA configuration
const jiraConfig = configManager.getSection('jira');

// Get GitHub configuration
const gitConfig = configManager.getSection('github');

// Get tech stack
const techStack = configManager.getSection('techStack');
```

### 4. Dynamic Routing by Execution Phase

```javascript
// Phase 1: Planning
orchestrator.setExecutionPhase('planning');
const planPath = orchestrator.resolveOutputPath('projectPlan');
orchestrator.saveJSONOutput(plan, 'project-plan.json', 'projectPlan');

// Phase 2: Design
orchestrator.setExecutionPhase('design');
const designPath = orchestrator.resolveOutputPath('designSpecs');
orchestrator.saveJSONOutput(specs, 'design-specs.json', 'designSpecs');

// Phase 3: Development
orchestrator.setExecutionPhase('development');
const codePath = orchestrator.resolveOutputPath('sourceCode');
orchestrator.saveJSONOutput(code, 'app.js', 'sourceCode');

// Phase 4: Testing
orchestrator.setExecutionPhase('testing');
const testPath = orchestrator.resolveOutputPath('testResults');
orchestrator.saveJSONOutput(results, 'test-results.json', 'testResults');

// Phase 5: Deployment
orchestrator.setExecutionPhase('deployment');
const deployPath = orchestrator.resolveOutputPath('deploymentGuide');
orchestrator.saveJSONOutput(guide, 'deployment-guide.json', 'deploymentGuide');
```

### 5. Feature Flag Control

```javascript
// Check if JIRA is enabled
if (orchestrator.isFeatureEnabled('enableJIRA')) {
  // Integrate with JIRA
  const credentials = orchestrator.getJIRACredentials();
}

// Check if GitHub is enabled
if (orchestrator.isFeatureEnabled('enableGitHub')) {
  // Push to GitHub
  const credentials = orchestrator.getGitHubCredentials();
}

// Check if observability is enabled
if (orchestrator.isFeatureEnabled('observabilityEnabled')) {
  // Send to DataDog
  const credentials = orchestrator.getObservabilityCredentials();
}
```

### 6. Get Complete Execution Context

```javascript
const context = orchestrator.getExecutionContext();

console.log('Current Phase:', context.phase);
console.log('Project Name:', context.project);
console.log('Output Paths:', context.outputPaths);
console.log('Enabled Services:', context.credentials);
console.log('Tech Stack:', context.techStack);
```

---

## Execution Phases & Output Routing

### Phase 1: Planning
| Output Type | Directory |
|------------|-----------|
| projectPlan | documents/ |
| riskAssessment | documents/ |
| requirements | documents/ |

### Phase 2: Design
| Output Type | Directory |
|------------|-----------|
| designSpecs | architecture/ |
| apiSchemas | architecture/ |
| databaseSchema | architecture/ |

### Phase 3: Development
| Output Type | Directory |
|------------|-----------|
| sourceCode | output/ |
| configFiles | output/ |
| documentation | documents/ |

### Phase 4: Testing
| Output Type | Directory |
|------------|-----------|
| testResults | test_results/ |
| coverageReports | test_results/ |
| performanceMetrics | test_results/ |

### Phase 5: Deployment
| Output Type | Directory |
|------------|-----------|
| deploymentGuide | documents/ |
| backupData | backups/ |
| operationalLogs | test_results/ |

---

## Integration Examples

### JIRA Integration
```javascript
const jiraConfig = orchestrator.getJIRACredentials();

// API endpoint: jiraConfig.apiEndpoint
// Token: jiraConfig.token
// Email: jiraConfig.email
// Project Key: jiraConfig.project

// Example API call
fetch(`${jiraConfig.apiEndpoint}issues`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jiraConfig.token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fields: {
      project: { key: jiraConfig.project },
      summary: 'Task summary'
    }
  })
});
```

### GitHub Integration
```javascript
const githubConfig = orchestrator.getGitHubCredentials();

// Repository: githubConfig.repository
// Token: githubConfig.token
// Branch: githubConfig.branch

// Example git operations
const { spawn } = require('child_process');
const git = spawn('git', ['push', 'origin', githubConfig.branch], {
  env: {
    ...process.env,
    GIT_ASKPASS: 'echo',
    GIT_ASKPASS_PROMPT: 'echo',
    GIT_USERNAME: githubConfig.token,
    GIT_PASSWORD: githubConfig.token
  }
});
```

### DataDog Integration
```javascript
const ddConfig = orchestrator.getObservabilityCredentials();

// API Key: ddConfig.apiKey
// Provider: ddConfig.provider

// Example monitoring
const dd = require('dd-trace').init();
dd.use('http', {
  headers: {
    'DD-API-KEY': ddConfig.apiKey
  }
});
```

---

## Tech Stack Routing

### Frontend
```javascript
const frontendConfig = orchestrator.getTechStackConfig('frontend');
console.log(frontendConfig.stack); // "React"
console.log(frontendConfig.outputPath); // "output/frontend"
console.log(frontendConfig.testPath); // "test_results/frontend"
```

### Backend
```javascript
const backendConfig = orchestrator.getTechStackConfig('backend');
console.log(backendConfig.stack); // "Node.js"
console.log(backendConfig.outputPath); // "output/backend"
console.log(backendConfig.testPath); // "test_results/backend"
```

### Database
```javascript
const dbConfig = orchestrator.getTechStackConfig('database');
console.log(dbConfig.type); // "SqlLite"
console.log(dbConfig.orm); // "Prisma"
console.log(dbConfig.schemaPath); // "architecture/database"
console.log(dbConfig.migrationsPath); // "output/migrations"
```

---

## Error Handling

```javascript
try {
  const orchestrator = new RoutingOrchestrator('./configuration.json');
  orchestrator.setExecutionPhase('development');
  const outputPath = orchestrator.resolveOutputPath('sourceCode');
  
  orchestrator.validatePaths(); // Validates all paths
  
  // Safe to proceed with file operations
  orchestrator.saveJSONOutput(data, 'output.json', 'sourceCode');
  
} catch (error) {
  console.error('Configuration error:', error.message);
  // Handle gracefully
}
```

---

## Command Line Usage

### Run Configuration Manager
```bash
node config.manager.js
```

Outputs:
- Runtime configuration
- Routing configuration
- Configuration summary

### Run Routing Orchestrator
```bash
node routing.orchestrator.js
```

Outputs:
- Routing summary
- Execution context
- Tech stack configuration
- Feature flags
- Path validation

---

## Security Best Practices

1. **Never commit credentials** to version control
   - Add `configuration.json` to `.gitignore`
   - Use environment variables for secrets

2. **Rotate API tokens regularly**
   - JIRA API Token
   - GitHub Personal Access Token
   - DataDog API Key

3. **Limit token permissions**
   - JIRA: Project-specific access
   - GitHub: Specific repository and branch access
   - DataDog: Read-only where possible

4. **Use environment variables**
   ```javascript
   // Instead of storing in config.json
   const config = {
     jira: {
       apiToken: process.env.JIRA_API_TOKEN
     },
     github: {
       personalAccessToken: process.env.GITHUB_PAT
     }
   };
   ```

---

## Troubleshooting

### Configuration Not Loading
```bash
# Verify file exists
ls -la configuration.json

# Check JSON validity
node -e "console.log(JSON.parse(require('fs').readFileSync('configuration.json', 'utf8')))"
```

### Paths Not Resolving
```javascript
// Enable debug logging
orchestrator.validatePaths();
orchestrator.resolveOutputPath('sourceCode');
```

### Credentials Not Working
```javascript
// Verify credentials are set
const jiraConfig = orchestrator.getJIRACredentials();
console.log(jiraConfig.apiToken); // Should not be empty
```

---

## Next Steps

1. **Update `.gitignore`**
   ```
   configuration.json
   .env
   *.local.json
   ```

2. **Set environment variables**
   ```bash
   export JIRA_API_TOKEN=***
   export GITHUB_PAT=***
   export DATADOG_API_KEY=***
   ```

3. **Integrate with your execution engine**
   - Import `RoutingOrchestrator` in your main workflow
   - Call `setExecutionPhase()` for each phase
   - Use routing methods to determine paths and credentials

4. **Monitor execution logs**
   - Watch for path resolution success
   - Verify file outputs
   - Track credential usage

---

## Summary

The configuration system provides:
- ✅ Centralized configuration management
- ✅ Dynamic input/output routing by execution phase
- ✅ Secure credential handling
- ✅ Feature flag control
- ✅ Integration support (JIRA, GitHub, DataDog)
- ✅ Tech stack awareness
- ✅ Extensible architecture

All configuration is stored in a single `configuration.json` file that maps to execution workflows.
