/**
 * Routing Orchestrator
 * Manages dynamic input/output routing across execution phases
 * Uses ConfigurationManager to determine paths and credentials
 */

const fs = require('fs');
const path = require('path');
const ConfigurationManager = require('./config.manager');

class RoutingOrchestrator {
  constructor(configPath = './configuration.json') {
    this.configManager = new ConfigurationManager(configPath);
    this.runtimeConfig = null;
    this.routingConfig = null;
    this.executionPhase = null;
    this.initialize();
  }

  /**
   * Initialize configuration and routing
   */
  initialize() {
    this.configManager.loadConfiguration();
    this.configManager.validate();
    this.runtimeConfig = this.configManager.buildRuntimeConfiguration();
    this.routingConfig = this.configManager.buildRoutingConfiguration();
    console.log('[ORCHESTRATOR] Initialization complete');
  }

  /**
   * Set current execution phase
   */
  setExecutionPhase(phase) {
    const validPhases = ['planning', 'design', 'development', 'testing', 'deployment'];
    if (!validPhases.includes(phase)) {
      throw new Error(`Invalid phase: ${phase}. Valid phases: ${validPhases.join(', ')}`);
    }
    this.executionPhase = phase;
    console.log(`[ORCHESTRATOR] Execution phase set to: ${phase}`);
  }

  /**
   * Resolve input path with validation
   */
  resolveInputPath(inputType) {
    const inputPath = this.configManager.getInputPath(inputType);
    if (!inputPath) {
      throw new Error(`Unknown input type: ${inputType}`);
    }

    if (!fs.existsSync(inputPath)) {
      console.warn(`[ORCHESTRATOR] Input path does not exist: ${inputPath}`);
    }

    console.log(`[ORCHESTRATOR] Input path resolved [${inputType}]: ${inputPath}`);
    return inputPath;
  }

  /**
   * Resolve output path and ensure directory exists
   */
  resolveOutputPath(fileType) {
    if (!this.executionPhase) {
      throw new Error('Execution phase not set. Call setExecutionPhase() first.');
    }

    const outputPath = this.configManager.getOutputPath(this.executionPhase, fileType);
    if (!outputPath) {
      throw new Error(`Unknown file type [${fileType}] for phase [${this.executionPhase}]`);
    }

    // Ensure directory exists
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
      console.log(`[ORCHESTRATOR] Created output directory: ${outputPath}`);
    }

    console.log(`[ORCHESTRATOR] Output path resolved [${fileType}]: ${outputPath}`);
    return outputPath;
  }

  /**
   * Get credentials for integration
   */
  getCredentials(service) {
    const credentials = this.routingConfig.credentials[service];
    if (!credentials) {
      throw new Error(`Unknown service: ${service}`);
    }
    return credentials;
  }

  /**
   * Get JIRA credentials and endpoint
   */
  getJIRACredentials() {
    return this.getCredentials('jira');
  }

  /**
   * Get GitHub credentials and repository info
   */
  getGitHubCredentials() {
    return this.getCredentials('github');
  }

  /**
   * Get observability credentials
   */
  getObservabilityCredentials() {
    return this.getCredentials('observability');
  }

  /**
   * Route file for storage based on type and phase
   */
  routeFileStorage(filename, fileType) {
    const basePath = this.resolveOutputPath(fileType);
    const fullPath = path.join(basePath, filename);
    return {
      directory: basePath,
      fullPath: fullPath,
      filename: filename,
    };
  }

  /**
   * Get tech stack configuration for current phase
   */
  getTechStackConfig(layer) {
    const techStackRouting = this.routingConfig.techStackRouting;
    return techStackRouting[layer] || null;
  }

  /**
   * Get feature flags for feature control
   */
  getFeatureFlags() {
    return this.routingConfig.featureFlags;
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(featureName) {
    return this.routingConfig.featureFlags[featureName] || false;
  }

  /**
   * Get complete execution context
   */
  getExecutionContext() {
    if (!this.executionPhase) {
      throw new Error('Execution phase not set');
    }

    return {
      phase: this.executionPhase,
      project: this.runtimeConfig.projectName,
      businessCaseFile: this.runtimeConfig.businessCaseFile,
      outputPaths: this.routingConfig.outputRouting[this.executionPhase],
      credentials: {
        jira: this.isFeatureEnabled('enableJIRA') ? this.getJIRACredentials() : null,
        github: this.isFeatureEnabled('enableGitHub') ? this.getGitHubCredentials() : null,
        observability: this.isFeatureEnabled('observabilityEnabled') ? this.getObservabilityCredentials() : null,
      },
      techStack: this.runtimeConfig.techStack,
      featureFlags: this.getFeatureFlags(),
    };
  }

  /**
   * Stream file to output path
   */
  async streamFileToOutput(sourceStream, filename, fileType) {
    try {
      const { fullPath } = this.routeFileStorage(filename, fileType);
      const writeStream = fs.createWriteStream(fullPath);

      return new Promise((resolve, reject) => {
        sourceStream.pipe(writeStream);
        writeStream.on('finish', () => {
          console.log(`[ORCHESTRATOR] File streamed successfully: ${fullPath}`);
          resolve(fullPath);
        });
        writeStream.on('error', reject);
      });
    } catch (error) {
      console.error('[ORCHESTRATOR] File streaming error:', error.message);
      throw error;
    }
  }

  /**
   * Save JSON output to file
   */
  saveJSONOutput(data, filename, fileType) {
    try {
      const { fullPath, directory } = this.routeFileStorage(filename, fileType);
      const jsonString = JSON.stringify(data, null, 2);
      fs.writeFileSync(fullPath, jsonString, 'utf8');
      console.log(`[ORCHESTRATOR] JSON output saved: ${fullPath}`);
      return fullPath;
    } catch (error) {
      console.error('[ORCHESTRATOR] JSON save error:', error.message);
      throw error;
    }
  }

  /**
   * Create execution log
   */
  createExecutionLog(eventType, message, metadata = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      phase: this.executionPhase,
      eventType,
      message,
      metadata,
    };

    console.log(`[LOG] ${eventType}: ${message}`);
    return logEntry;
  }

  /**
   * Get routing summary for current execution
   */
  getRoutingSummary() {
    if (!this.executionPhase) {
      return null;
    }

    return {
      executionPhase: this.executionPhase,
      projectName: this.runtimeConfig.projectName,
      outputDirectory: this.runtimeConfig.paths.output,
      outputPaths: this.routingConfig.outputRouting[this.executionPhase],
      inputPaths: this.routingConfig.inputRouting,
      enabledServices: {
        jira: this.isFeatureEnabled('enableJIRA'),
        github: this.isFeatureEnabled('enableGitHub'),
        observability: this.isFeatureEnabled('observabilityEnabled'),
      },
      techStack: this.runtimeConfig.techStack,
    };
  }

  /**
   * Validate all paths exist before execution
   */
  validatePaths() {
    const missingPaths = [];

    // Check input paths
    Object.entries(this.routingConfig.inputRouting).forEach(([key, config]) => {
      if (!fs.existsSync(config.path)) {
        missingPaths.push({ type: 'input', key, path: config.path });
      }
    });

    // Check output paths for current phase
    if (this.executionPhase) {
      const phaseOutputs = this.routingConfig.outputRouting[this.executionPhase];
      Object.entries(phaseOutputs).forEach(([key, dirPath]) => {
        // Create if not exists
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      });
    }

    if (missingPaths.length > 0) {
      console.warn('[ORCHESTRATOR] Missing input paths:');
      missingPaths.forEach(p => console.warn(`  - [${p.type}] ${p.key}: ${p.path}`));
    }

    console.log('[ORCHESTRATOR] Path validation complete');
    return missingPaths.length === 0;
  }
}

// Export for use as module
module.exports = RoutingOrchestrator;

// If run directly, demonstrate usage
if (require.main === module) {
  const orchestrator = new RoutingOrchestrator();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('ROUTING ORCHESTRATOR DEMO');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Set execution phase
  orchestrator.setExecutionPhase('planning');

  console.log('\n--- Routing Summary ---');
  console.log(JSON.stringify(orchestrator.getRoutingSummary(), null, 2));

  console.log('\n--- Execution Context ---');
  console.log(JSON.stringify(orchestrator.getExecutionContext(), null, 2));

  console.log('\n--- Tech Stack Configuration ---');
  console.log(JSON.stringify(orchestrator.getTechStackConfig('backend'), null, 2));

  console.log('\n--- Feature Flags ---');
  console.log(JSON.stringify(orchestrator.getFeatureFlags(), null, 2));

  console.log('\n--- Path Validation ---');
  orchestrator.validatePaths();

  console.log('\n[ORCHESTRATOR] Demo complete\n');
}
