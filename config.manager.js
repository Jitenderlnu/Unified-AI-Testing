/**
 * Configuration Manager
 * Parses configuration.json and provides runtime configuration properties
 * for dynamic routing of inputs/outputs across all execution phases
 */

const fs = require('fs');
const path = require('path');

class ConfigurationManager {
  constructor(configPath = './configuration.json') {
    this.configPath = configPath;
    this.config = null;
    this.runtimeConfig = null;
    this.routingConfig = null;
  }

  /**
   * Load and parse configuration.json
   */
  loadConfiguration() {
    try {
      const rawConfig = fs.readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(rawConfig);
      console.log('[CONFIG] Configuration loaded successfully');
      return this.config;
    } catch (error) {
      console.error('[CONFIG ERROR] Failed to load configuration:', error.message);
      throw new Error(`Configuration load failed: ${error.message}`);
    }
  }

  /**
   * Build runtime configuration with all mapped properties
   */
  buildRuntimeConfiguration() {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfiguration() first.');
    }

    this.runtimeConfig = {
      // Project Metadata
      projectName: this.config.projectMetadata.projectName,
      businessCaseFile: this.config.projectMetadata.businessCaseFile,

      // Paths - Input/Output Routing
      paths: {
        root: path.dirname(this.configPath),
        businessCase: this.config.projectMetadata.businessCaseFile,
        output: this.config.paths.output,
        documents: this.config.paths.documents,
        testResults: this.config.paths.testResults,
        architecture: this.config.paths.architecture,
        wireframes: this.config.paths.wireframes,
        backups: this.config.paths.backups,
      },

      // JIRA Configuration
      jira: {
        enabled: this.config.jira.isNewJIRA,
        isNew: this.config.jira.isNewJIRA,
        hostURL: this.config.jira.hostURL,
        projectKey: this.config.jira.projectKey,
        boardID: this.config.jira.boardID,
        apiToken: this.config.jira.apiToken,
        userEmail: this.config.jira.userEmail,
        apiEndpoint: `${this.config.jira.hostURL}rest/api/3/`,
      },

      // GitHub Configuration
      github: {
        enabled: this.config.versionControl.isNewRepository,
        isNew: this.config.versionControl.isNewRepository,
        provider: this.config.versionControl.provider,
        repositoryURL: this.config.versionControl.repositoryURL,
        branchStrategy: this.config.versionControl.branchStrategy,
        mainBranch: this.config.versionControl.mainBranch,
        personalAccessToken: this.config.versionControl.personalAccessToken,
        cicdTemplate: this.config.versionControl.cicdTemplate,
      },

      // Design System (Stitch)
      design: {
        projectName: this.config.design.stitchProjectName,
        workspaceID: this.config.design.stitchWorkspaceID,
      },

      // Technology Stack
      techStack: {
        frontend: this.config.techStack.frontend,
        backend: this.config.techStack.backend,
        database: this.config.techStack.database,
        orm: this.config.techStack.orm,
      },

      // Observability
      observability: {
        provider: this.config.observability.provider,
        apiKey: this.config.observability.apiKey,
        datadogKey: this.config.observability.apiKey,
      },

      // Quality & Security
      quality: {
        testingFramework: this.config.quality.testingFramework,
        sastTool: this.config.quality.sastTool,
      },
    };

    console.log('[CONFIG] Runtime configuration built successfully');
    return this.runtimeConfig;
  }

  /**
   * Build routing configuration for dynamic input/output routing
   */
  buildRoutingConfiguration() {
    if (!this.runtimeConfig) {
      this.buildRuntimeConfiguration();
    }

    this.routingConfig = {
      // Input routing based on project phase
      inputRouting: {
        businessCase: {
          path: this.runtimeConfig.paths.businessCase,
          format: 'pdf',
          routing: 'documentation',
        },
        specifications: {
          path: this.runtimeConfig.paths.documents,
          format: 'json|pdf|md',
          routing: 'documentation',
        },
        architecture: {
          path: this.runtimeConfig.paths.architecture,
          format: 'drawio|svg|json',
          routing: 'design',
        },
        wireframes: {
          path: this.runtimeConfig.paths.wireframes,
          format: 'figma|svg|png',
          routing: 'design',
        },
      },

      // Output routing by execution phase
      outputRouting: {
        // Phase 1: Planning & Analysis
        planning: {
          projectPlan: this.runtimeConfig.paths.documents,
          riskAssessment: this.runtimeConfig.paths.documents,
          requirements: this.runtimeConfig.paths.documents,
        },

        // Phase 2: Design & Architecture
        design: {
          designSpecs: this.runtimeConfig.paths.architecture,
          apiSchemas: this.runtimeConfig.paths.architecture,
          databaseSchema: this.runtimeConfig.paths.architecture,
        },

        // Phase 3: Development
        development: {
          sourceCode: this.runtimeConfig.paths.output,
          configFiles: this.runtimeConfig.paths.output,
          documentation: this.runtimeConfig.paths.documents,
        },

        // Phase 4: Testing
        testing: {
          testResults: this.runtimeConfig.paths.testResults,
          coverageReports: this.runtimeConfig.paths.testResults,
          performanceMetrics: this.runtimeConfig.paths.testResults,
        },

        // Phase 5: Deployment & Operations
        deployment: {
          deploymentGuide: this.runtimeConfig.paths.documents,
          backupData: this.runtimeConfig.paths.backups,
          operationalLogs: this.runtimeConfig.paths.testResults,
        },
      },

      // Credential routing
      credentials: {
        jira: {
          type: 'api_token',
          endpoint: this.runtimeConfig.jira.apiEndpoint,
          token: this.runtimeConfig.jira.apiToken,
          email: this.runtimeConfig.jira.userEmail,
          project: this.runtimeConfig.jira.projectKey,
        },
        github: {
          type: 'personal_access_token',
          repository: this.runtimeConfig.github.repositoryURL,
          token: this.runtimeConfig.github.personalAccessToken,
          branch: this.runtimeConfig.github.mainBranch,
        },
        observability: {
          type: 'api_key',
          provider: this.runtimeConfig.observability.provider,
          apiKey: this.runtimeConfig.observability.apiKey,
        },
      },

      // Tech stack routing - determines tools and frameworks to use
      techStackRouting: {
        frontend: {
          stack: this.runtimeConfig.techStack.frontend,
          outputPath: path.join(this.runtimeConfig.paths.output, 'frontend'),
          testPath: path.join(this.runtimeConfig.paths.testResults, 'frontend'),
        },
        backend: {
          stack: this.runtimeConfig.techStack.backend,
          outputPath: path.join(this.runtimeConfig.paths.output, 'backend'),
          testPath: path.join(this.runtimeConfig.paths.testResults, 'backend'),
        },
        database: {
          type: this.runtimeConfig.techStack.database,
          orm: this.runtimeConfig.techStack.orm,
          schemaPath: path.join(this.runtimeConfig.paths.architecture, 'database'),
          migrationsPath: path.join(this.runtimeConfig.paths.output, 'migrations'),
        },
      },

      // Feature flags for execution control
      featureFlags: {
        enableJIRA: this.runtimeConfig.jira.enabled,
        enableGitHub: this.runtimeConfig.github.enabled,
        useNewJIRA: this.runtimeConfig.jira.isNew,
        useNewRepository: this.runtimeConfig.github.isNew,
        cicdEnabled: this.runtimeConfig.github.enabled,
        observabilityEnabled: !!this.runtimeConfig.observability.provider,
      },
    };

    console.log('[CONFIG] Routing configuration built successfully');
    return this.routingConfig;
  }

  /**
   * Get complete configuration object
   */
  getConfiguration() {
    if (!this.runtimeConfig) {
      this.buildRuntimeConfiguration();
    }
    return this.runtimeConfig;
  }

  /**
   * Get routing configuration
   */
  getRoutingConfiguration() {
    if (!this.routingConfig) {
      this.buildRoutingConfiguration();
    }
    return this.routingConfig;
  }

  /**
   * Get specific configuration section
   */
  getSection(sectionName) {
    if (!this.runtimeConfig) {
      this.buildRuntimeConfiguration();
    }
    return this.runtimeConfig[sectionName] || null;
  }

  /**
   * Get output path for a specific execution phase
   */
  getOutputPath(phase, fileType) {
    if (!this.routingConfig) {
      this.buildRoutingConfiguration();
    }
    const phaseOutputs = this.routingConfig.outputRouting[phase];
    return phaseOutputs ? phaseOutputs[fileType] : null;
  }

  /**
   * Get input path for a specific input type
   */
  getInputPath(inputType) {
    if (!this.routingConfig) {
      this.buildRoutingConfiguration();
    }
    const input = this.routingConfig.inputRouting[inputType];
    return input ? input.path : null;
  }

  /**
   * Validate configuration integrity
   */
  validate() {
    const errors = [];

    // Validate required fields
    if (!this.config.projectMetadata?.projectName) {
      errors.push('Missing: projectMetadata.projectName');
    }

    if (!this.config.paths?.output) {
      errors.push('Missing: paths.output');
    }

    if (!this.config.jira?.apiToken) {
      errors.push('Missing: jira.apiToken');
    }

    if (!this.config.versionControl?.personalAccessToken) {
      errors.push('Missing: versionControl.personalAccessToken');
    }

    if (errors.length > 0) {
      console.error('[CONFIG VALIDATION] Errors found:');
      errors.forEach(err => console.error(`  - ${err}`));
      return false;
    }

    console.log('[CONFIG VALIDATION] All validations passed');
    return true;
  }

  /**
   * Export configuration as summary
   */
  getSummary() {
    if (!this.runtimeConfig) {
      this.buildRuntimeConfiguration();
    }

    return {
      projectName: this.runtimeConfig.projectName,
      businessCaseFile: this.runtimeConfig.businessCaseFile,
      outputDirectory: this.runtimeConfig.paths.output,
      jiraEnabled: this.runtimeConfig.jira.enabled,
      jiraProject: this.runtimeConfig.jira.projectKey,
      githubEnabled: this.runtimeConfig.github.enabled,
      githubRepository: this.runtimeConfig.github.repositoryURL,
      techStack: this.runtimeConfig.techStack,
      observabilityProvider: this.runtimeConfig.observability.provider,
      testingFramework: this.runtimeConfig.quality.testingFramework,
    };
  }
}

// Export for use as module
module.exports = ConfigurationManager;

// If run directly, initialize and display configuration
if (require.main === module) {
  const configManager = new ConfigurationManager();
  configManager.loadConfiguration();
  configManager.validate();
  const config = configManager.buildRuntimeConfiguration();
  const routing = configManager.buildRoutingConfiguration();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('RUNTIME CONFIGURATION');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(JSON.stringify(config, null, 2));

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('ROUTING CONFIGURATION');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(JSON.stringify(routing, null, 2));

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('CONFIGURATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(JSON.stringify(configManager.getSummary(), null, 2));
}
