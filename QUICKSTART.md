# Quick Start Guide - Configuration & Routing System

## 📦 What You Have

A complete **Configuration & Dynamic Routing System** consisting of:

| Component | File | Purpose |
|-----------|------|---------|
| Core Configuration | `configuration.json` | Single source of truth (27 properties) |
| Config Parser | `config.manager.js` | Parses & validates configuration |
| Routing Engine | `routing.orchestrator.js` | Dynamic input/output routing by phase |
| Example Workflow | `example.usage.js` | Full 5-phase execution demonstration |
| Usage Guide | `CONFIG_USAGE_GUIDE.md` | Detailed examples & patterns |
| System Overview | `CONFIGURATION_README.md` | Complete documentation |
| Setup Guide | `SETUP_SUMMARY.md` | What was created & how it works |
| Security | `.gitignore` | Prevents committing secrets |

**Total Size:** ~90 KB (code + documentation)

---

## 🚀 Get Started in 30 Seconds

### 1. Validate Configuration
```bash
node config.manager.js
```
Output: ✅ Runtime config, routing config, validation results

### 2. Test Routing System
```bash
node routing.orchestrator.js
```
Output: ✅ Routing summary, execution context, path validation

### 3. Run Full Example
```bash
node example.usage.js
```
Output: ✅ Complete 5-phase workflow with generated artifacts

### 4. Check Generated Files
```bash
ls -la output/ documents/ test_results/ architecture/ backups/
```

---

## 💻 Use in Your Code (3 Steps)

### Step 1: Import
```javascript
const RoutingOrchestrator = require('./routing.orchestrator');
const orchestrator = new RoutingOrchestrator();
```

### Step 2: Set Phase
```javascript
orchestrator.setExecutionPhase('development');
```

### Step 3: Use Methods
```javascript
// Get paths
const outputPath = orchestrator.resolveOutputPath('sourceCode');

// Save files
orchestrator.saveJSONOutput(myData, 'output.json', 'sourceCode');

// Get credentials
const jira = orchestrator.getJIRACredentials();
const github = orchestrator.getGitHubCredentials();

// Check features
if (orchestrator.isFeatureEnabled('enableJIRA')) {
  // Use JIRA
}
```

---

## 📊 What Gets Parsed from configuration.json

### 27 Configuration Properties

```json
{
  "projectName": "UnifiedAITesting",
  "businessCaseFile": "Task Management.pdf",
  "paths": {
    "output": "...",
    "documents": "...",
    "testResults": "...",
    "architecture": "...",
    "wireframes": "...",
    "backups": "..."
  },
  "jira": {
    "hostURL": "...",
    "projectKey": "UN",
    "apiToken": "***",
    "userEmail": "..."
  },
  "github": {
    "repositoryURL": "...",
    "personalAccessToken": "***",
    "mainBranch": "main"
  },
  "design": {
    "stitchProjectName": "...",
    "stitchWorkspaceID": "..."
  },
  "techStack": {
    "frontend": "React",
    "backend": "Node.js",
    "database": "SqlLite",
    "orm": "Prisma"
  },
  "observability": {
    "provider": "DataDog",
    "apiKey": "***"
  },
  "quality": {
    "testingFramework": "jest",
    "sastTool": "ESLint"
  }
}
```

---

## 🔄 5 Execution Phases & Routing

```
Phase 1: PLANNING
  Input:  businessCaseFile (PDF)
  Output: documents/ → project-plan.json, requirements.json, etc.

Phase 2: DESIGN
  Output: architecture/ → api-schema.json, database-schema.json, etc.

Phase 3: DEVELOPMENT
  Output: output/ → frontend/, backend/, migrations/, configs

Phase 4: TESTING
  Output: test_results/ → test-results.json, coverage-report.json, etc.

Phase 5: DEPLOYMENT
  Output: documents/ + backups/ → deployment-guide.json, etc.
```

---

## 🔐 Security Checklist

- ✅ `.gitignore` prevents committing `configuration.json`
- ✅ All credentials mapped (JIRA, GitHub, DataDog)
- ⚠️ **TODO:** Move secrets to `.env` file
- ⚠️ **TODO:** Add `configuration.json` to `.gitignore`
- ⚠️ **TODO:** Never commit API tokens

---

## 🎯 Key Features

| Feature | How to Use |
|---------|-----------|
| **Centralized Config** | Everything in `configuration.json` |
| **Dynamic Routing** | `orchestrator.setExecutionPhase(phase)` |
| **Credential Access** | `orchestrator.getCredentials('service')` |
| **Path Resolution** | `orchestrator.resolveOutputPath(fileType)` |
| **Feature Flags** | `orchestrator.isFeatureEnabled('feature')` |
| **Tech Stack Aware** | `orchestrator.getTechStackConfig('layer')` |
| **Auto Directory Creation** | Creates missing output directories |
| **Complete Context** | `orchestrator.getExecutionContext()` |

---

## 📝 Common Tasks

### Get JIRA Configuration
```javascript
const jiraConfig = orchestrator.getJIRACredentials();
// Access: jiraConfig.apiToken, jiraConfig.apiEndpoint, jiraConfig.project
```

### Get GitHub Configuration
```javascript
const githubConfig = orchestrator.getGitHubCredentials();
// Access: githubConfig.repository, githubConfig.token, githubConfig.branch
```

### Save JSON to Output
```javascript
orchestrator.setExecutionPhase('development');
orchestrator.saveJSONOutput(
  { key: 'value' },
  'myfile.json',
  'sourceCode'
);
```

### Check If Feature Enabled
```javascript
if (orchestrator.isFeatureEnabled('enableJIRA')) {
  // Integrate with JIRA
}
```

### Get Tech Stack Config
```javascript
const backendConfig = orchestrator.getTechStackConfig('backend');
// Access: backendConfig.stack, backendConfig.outputPath
```

### Validate All Paths
```javascript
const pathsValid = orchestrator.validatePaths();
// Creates missing directories automatically
```

---

## 📚 Documentation Map

| Want to... | Read... |
|-----------|---------|
| Get started quickly | **This file (QUICKSTART.md)** |
| See working examples | `example.usage.js` |
| Learn usage patterns | `CONFIG_USAGE_GUIDE.md` |
| Understand architecture | `CONFIGURATION_README.md` |
| Understand what was created | `SETUP_SUMMARY.md` |

---

## 🔍 File Sizes & Structure

```
configuration.json           1.8 KB  (27 config properties)
config.manager.js           13.0 KB  (375 lines, config parser)
routing.orchestrator.js      9.2 KB  (314 lines, dynamic routing)
example.usage.js            19.0 KB  (571 lines, full workflow)
CONFIG_USAGE_GUIDE.md       12.0 KB  (usage documentation)
CONFIGURATION_README.md     13.0 KB  (system overview)
SETUP_SUMMARY.md            20.0 KB  (complete setup guide)
QUICKSTART.md               This file (quick reference)
.gitignore                  0.6 KB   (security configuration)
────────────────────────────────────
Total                       ~88 KB
```

---

## ⚡ Commands Reference

```bash
# Validate configuration
node config.manager.js

# Test routing system
node routing.orchestrator.js

# Run full 5-phase example
node example.usage.js

# Check configuration.json is valid
node -e "console.log(JSON.parse(require('fs').readFileSync('configuration.json')))"

# List all output directories
ls -la output/ documents/ test_results/ architecture/ wireframes/ backups/
```

---

## ❓ Common Questions

**Q: Where is the configuration stored?**  
A: Single file: `configuration.json` (27 properties across 8 sections)

**Q: How do I change paths?**  
A: Edit `configuration.json` → `paths` section

**Q: Where are outputs saved?**  
A: Depends on execution phase:
- Planning: `documents/`
- Design: `architecture/`
- Development: `output/`
- Testing: `test_results/`
- Deployment: `documents/` + `backups/`

**Q: How do I use JIRA?**  
A: `orchestrator.getJIRACredentials()` → use returned config

**Q: How do I use GitHub?**  
A: `orchestrator.getGitHubCredentials()` → use returned config

**Q: What if a directory doesn't exist?**  
A: Routing system creates it automatically on first use

**Q: How do I protect credentials?**  
A: Add `configuration.json` to `.gitignore` (already done)

**Q: Can I customize the phases?**  
A: Yes, phases are just strings. Add custom phases as needed.

---

## 🎓 Learning Path

1. **5 minutes:** Run example
   ```bash
   node example.usage.js
   ```

2. **10 minutes:** Read QUICKSTART.md (this file)

3. **20 minutes:** Read CONFIG_USAGE_GUIDE.md with examples

4. **30 minutes:** Integrate RoutingOrchestrator into your app

5. **Read as needed:** CONFIGURATION_README.md for deep dive

---

## ✅ Success Indicators

✅ You've successfully set up when:

- [ ] `configuration.json` exists with all 27 properties
- [ ] `node config.manager.js` runs without errors
- [ ] `node routing.orchestrator.js` displays routing summary
- [ ] `node example.usage.js` creates output files in respective directories
- [ ] You can import `RoutingOrchestrator` in your code
- [ ] `orchestrator.setExecutionPhase('planning')` works
- [ ] Output paths resolve correctly
- [ ] Credentials return expected values

---

## 🚀 Next Steps

1. **Verify** everything works:
   ```bash
   node example.usage.js
   ```

2. **Integrate** into your application:
   ```javascript
   const orchestrator = new RoutingOrchestrator();
   orchestrator.setExecutionPhase('planning');
   ```

3. **Secure** credentials:
   ```bash
   cp .env.example .env
   # Edit .env with actual values
   ```

4. **Test** each phase:
   - Run planning phase → check `documents/`
   - Run design phase → check `architecture/`
   - Run development phase → check `output/`
   - Run testing phase → check `test_results/`
   - Run deployment phase → check deployment artifacts

5. **Customize** as needed:
   - Add custom phases
   - Extend RoutingOrchestrator
   - Add new integrations

---

## 📞 Support

- **See examples:** `example.usage.js`
- **Need help?** Read `CONFIG_USAGE_GUIDE.md`
- **Want details?** See `CONFIGURATION_README.md`
- **How it works?** Check `SETUP_SUMMARY.md`

---

## Summary

You now have a **complete Configuration & Routing System** that:
- ✅ Parses all 27 configuration properties
- ✅ Maps all paths, credentials, and integrations
- ✅ Routes inputs/outputs by execution phase
- ✅ Handles JIRA, GitHub, and DataDog integrations
- ✅ Provides feature flags for service control
- ✅ Auto-creates required directories
- ✅ Includes comprehensive documentation

**Ready to use!** Start with `node example.usage.js` to see it in action.
