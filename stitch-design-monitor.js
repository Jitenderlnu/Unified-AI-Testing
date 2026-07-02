/**
 * Stitch Design Change Monitor & Component Prep Pipeline
 *
 * Polls the Stitch project for design changes made by UX designer
 * Automatically maps finalized UI assets to component generation parameters
 * Prepares component scaffolding for React implementation
 *
 * Usage: node stitch-design-monitor.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  projectId: '2108938708409058757',
  projectName: 'UnifiedAITesting',
  pollingInterval: 30000, // 30 seconds
  outputDir: path.join(__dirname, 'output', 'component-prep'),
  designTokensMap: {
    colors: {
      primary: '#1976d2',
      success: '#388e3c',
      error: '#d32f2f',
      warning: '#f57c00',
      info: '#1976d2',
      background: '#f5f5f5',
      surface: '#ffffff',
    },
    typography: {
      headline: 'Manrope',
      body: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto',
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
    borderRadius: {
      sm: '2px',
      md: '4px',
      lg: '8px',
      full: '9999px',
    },
  },
};

// State tracking
let lastKnownState = {
  screens: {},
  assets: {},
  timestamp: Date.now(),
};

/**
 * Initialize output directories
 */
function initializeOutputDirectories() {
  const dirs = [
    CONFIG.outputDir,
    path.join(CONFIG.outputDir, 'components'),
    path.join(CONFIG.outputDir, 'design-tokens'),
    path.join(CONFIG.outputDir, 'mappings'),
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  console.log(`✓ Output directories initialized at: ${CONFIG.outputDir}`);
}

/**
 * Map design tokens to component props
 */
function mapDesignTokens() {
  const tokenMapping = {
    colors: Object.entries(CONFIG.designTokensMap.colors).map(([key, value]) => ({
      token: key,
      value: value,
      cssVar: `--color-${key}`,
      reactProp: `color="${key}"`,
    })),
    typography: Object.entries(CONFIG.designTokensMap.typography).map(([key, value]) => ({
      token: key,
      value: value,
      cssVar: `--font-${key}`,
      reactProp: `variant="${key}"`,
    })),
    spacing: Object.entries(CONFIG.designTokensMap.spacing).map(([key, value]) => ({
      token: key,
      value: value,
      cssVar: `--spacing-${key}`,
      reactProp: `spacing="${key}"`,
    })),
  };

  return tokenMapping;
}

/**
 * Generate component scaffold from design metadata
 */
function generateComponentScaffold(screenName, screenMetadata) {
  const componentName = toPascalCase(screenName);

  const scaffold = `/**
 * Component: ${componentName}
 * Source: Stitch Design - ${screenName}
 * Generated: ${new Date().toISOString()}
 *
 * Design System Integration:
 * - Colors: Primary (#1976D2), Success (#388E3C), Error (#D32F2F)
 * - Typography: Manrope (headlines), System stack (body)
 * - Spacing: 4px, 8px, 16px, 24px, 32px
 * - Border Radius: 2px, 4px, 8px, full
 */

import React, { useState } from 'react';
import styles from './${screenName}.module.css';

interface ${componentName}Props {
  // Design tokens from Stitch
  colorScheme?: 'light' | 'dark';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  // Component-specific props
  [key: string]: any;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  colorScheme = 'light',
  spacing = 'md',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div
      className={styles.container}
      data-color-scheme={colorScheme}
      data-spacing={spacing}
      {...props}
    >
      {/* TODO: Map Stitch design to component structure */}
      <div className={styles.content}>
        <h1>${componentName} Component</h1>
        <p>Auto-generated from Stitch design: ${screenName}</p>
      </div>
    </div>
  );
};

export default ${componentName};
`;

  return scaffold;
}

/**
 * Generate component styles mapping
 */
function generateComponentStyles(screenName, designTokens) {
  const fileName = `${screenName}.module.css`;

  const styles = \`/**
 * Styles: ${screenName}
 * Auto-generated from Stitch design tokens
 * Design System: Primary (#1976D2), Success (#388E3C), Error (#D32F2F)
 */

:root {
  /* Colors */
  --color-primary: #1976d2;
  --color-success: #388e3c;
  --color-error: #d32f2f;
  --color-warning: #f57c00;
  --color-background: #f5f5f5;
  --color-surface: #ffffff;

  /* Typography */
  --font-headline: Manrope, sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Border Radius */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-full: 9999px;
}

.container {
  padding: var(--spacing-md);
  background: var(--color-surface);
  color: var(--color-text, #212121);
  border-radius: var(--radius-md);
}

.content {
  font-family: var(--font-body);
  line-height: 1.6;
}

.content h1 {
  font-family: var(--font-headline);
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .container {
    padding: var(--spacing-xs);
  }
}
\`;

  return styles;
}

/**
 * Create component mapping document
 */
function generateComponentMapping(screenName, screenMetadata) {
  const mapping = {
    screenName,
    componentName: toPascalCase(screenName),
    designTokens: mapDesignTokens(),
    layoutParameters: extractLayoutParameters(screenMetadata),
    generatedAt: new Date().toISOString(),
    wireframeReferences: getWireframeReferences(screenName),
  };

  return mapping;
}

/**
 * Extract layout parameters from screen metadata
 */
function extractLayoutParameters(metadata) {
  return {
    layout: 'flex', // Default
    breakpoints: {
      mobile: '<768px',
      tablet: '768px-1023px',
      desktop: '>=1024px',
    },
    gridSystem: '12-column',
    spacing: {
      gutter: '16px',
      margin: '24px',
      padding: '20px',
    },
  };
}

/**
 * Get wireframe references for this screen
 */
function getWireframeReferences(screenName) {
  const wireframeDir = path.join(__dirname, 'wireframes');

  if (!fs.existsSync(wireframeDir)) {
    return [];
  }

  return fs.readdirSync(wireframeDir)
    .filter(file => file.includes(screenName.toLowerCase()) || file.endsWith('.html'))
    .map(file => ({
      filename: file,
      path: path.join('wireframes', file),
      type: 'html-skeleton',
    }));
}

/**
 * Poll Stitch project for design changes
 */
async function pollDesignChanges() {
  console.log(`\n📊 [${new Date().toISOString()}] Polling Stitch project for design changes...`);

  try {
    // Check for new/modified screens (placeholder for actual Stitch API call)
    const currentScreens = {
      'task-create-form': {
        id: 'screen-001',
        name: 'Task Create Form',
        lastModified: Date.now(),
        type: 'form',
      },
      'task-list': {
        id: 'screen-002',
        name: 'Task List',
        lastModified: Date.now(),
        type: 'list',
      },
    };

    // Detect changes
    const changes = detectChanges(currentScreens);

    if (changes.new.length > 0) {
      console.log(`\n✨ Detected ${changes.new.length} new design(s):`);
      changes.new.forEach(screen => {
        console.log(`  • ${screen.name} (ID: ${screen.id})`);
        processDesignChange(screen);
      });
    }

    if (changes.modified.length > 0) {
      console.log(`\n🔄 Detected ${changes.modified.length} modified design(s):`);
      changes.modified.forEach(screen => {
        console.log(`  • ${screen.name} - Updated at ${new Date(screen.lastModified).toLocaleString()}`);
        processDesignChange(screen);
      });
    }

    if (changes.new.length === 0 && changes.modified.length === 0) {
      console.log('  No changes detected');
    }

    lastKnownState.screens = currentScreens;
    lastKnownState.timestamp = Date.now();

  } catch (error) {
    console.error('❌ Error polling design changes:', error.message);
  }
}

/**
 * Detect new or modified screens
 */
function detectChanges(currentScreens) {
  const changes = {
    new: [],
    modified: [],
  };

  // New screens
  Object.entries(currentScreens).forEach(([key, screen]) => {
    if (!lastKnownState.screens[key]) {
      changes.new.push(screen);
    }
  });

  // Modified screens
  Object.entries(currentScreens).forEach(([key, screen]) => {
    if (lastKnownState.screens[key] &&
        lastKnownState.screens[key].lastModified !== screen.lastModified) {
      changes.modified.push(screen);
    }
  });

  return changes;
}

/**
 * Process individual design change
 */
function processDesignChange(screen) {
  console.log(`\n  📐 Processing: ${screen.name}`);

  // Generate component scaffold
  const componentCode = generateComponentScaffold(screen.name, screen);
  const componentPath = path.join(
    CONFIG.outputDir,
    'components',
    \`\${toCamelCase(screen.name)}.tsx\`
  );
  fs.writeFileSync(componentPath, componentCode);
  console.log(`    ✓ Generated component scaffold: \${path.basename(componentPath)}\`);

  // Generate styles
  const styles = generateComponentStyles(screen.name, mapDesignTokens());
  const stylesPath = path.join(
    CONFIG.outputDir,
    'components',
    \`\${toCamelCase(screen.name)}.module.css\`
  );
  fs.writeFileSync(stylesPath, styles);
  console.log(`    ✓ Generated component styles: \${path.basename(stylesPath)}\`);

  // Generate mapping
  const mapping = generateComponentMapping(screen.name, screen);
  const mappingPath = path.join(
    CONFIG.outputDir,
    'mappings',
    \`\${toCamelCase(screen.name)}-mapping.json\`
  );
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`    ✓ Generated design mapping: \${path.basename(mappingPath)}\`);
}

/**
 * Save design tokens reference
 */
function saveDesignTokensReference() {
  const tokens = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    tokens: mapDesignTokens(),
    cssVariables: generateCSSVariables(),
  };

  const tokensPath = path.join(CONFIG.outputDir, 'design-tokens', 'tokens.json');
  fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
  console.log(`✓ Design tokens reference saved: ${tokensPath}`);
}

/**
 * Generate CSS variables from design tokens
 */
function generateCSSVariables() {
  const css = \`:root {
  /* Colors */
  --color-primary: #1976d2;
  --color-success: #388e3c;
  --color-error: #d32f2f;
  --color-warning: #f57c00;
  --color-background: #f5f5f5;
  --color-surface: #ffffff;

  /* Typography */
  --font-headline: Manrope, sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Border Radius */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-full: 9999px;
}
\`;

  const cssPath = path.join(CONFIG.outputDir, 'design-tokens', 'tokens.css');
  fs.writeFileSync(cssPath, css);

  return css;
}

/**
 * Utility: Convert to PascalCase
 */
function toPascalCase(str) {
  return str
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Utility: Convert to camelCase
 */
function toCamelCase(str) {
  return str
    .split(/[-_\s]/)
    .map((word, i) =>
      i === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}

/**
 * Generate monitoring status report
 */
function generateStatusReport() {
  const report = {
    projectId: CONFIG.projectId,
    projectName: CONFIG.projectName,
    monitoringStatus: 'active',
    pollingInterval: \`\${CONFIG.pollingInterval / 1000}s\`,
    lastCheck: new Date(lastKnownState.timestamp).toISOString(),
    designTokensConfigured: Object.keys(CONFIG.designTokensMap).length,
    outputDirectory: CONFIG.outputDir,
  };

  const reportPath = path.join(CONFIG.outputDir, 'monitoring-status.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📋 Monitoring Status Report: ${reportPath}`);

  return report;
}

/**
 * Initialize and start monitoring
 */
function initialize() {
  console.log('🚀 Stitch Design Monitor v1.0.0');
  console.log('===================================\n');
  console.log(`Project: ${CONFIG.projectName} (ID: ${CONFIG.projectId})`);
  console.log(`Polling Interval: ${CONFIG.pollingInterval / 1000} seconds`);
  console.log(`Output Directory: ${CONFIG.outputDir}\n`);

  initializeOutputDirectories();
  saveDesignTokensReference();

  console.log('\n✅ Initialization complete. Starting polling...\n');

  // Initial poll
  pollDesignChanges();

  // Continuous polling
  setInterval(() => {
    pollDesignChanges();
    generateStatusReport();
  }, CONFIG.pollingInterval);

  console.log(`\n⏱️  Monitoring active. Next check in ${CONFIG.pollingInterval / 1000}s...`);
  console.log('Press Ctrl+C to stop monitoring.\n');
}

// Start monitoring
initialize();

module.exports = { pollDesignChanges, generateComponentScaffold, mapDesignTokens };
