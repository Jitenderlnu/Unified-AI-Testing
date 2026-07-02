#!/usr/bin/env node

/**
 * JIRA Story Importer
 *
 * Reads Estimated_Backlog.json and creates user stories and subtasks in JIRA
 * via the REST API (v3).
 *
 * Usage: node jira-story-importer.js <config-file> <backlog-file>
 * Example: node jira-story-importer.js configuration.json documents/Estimated_Backlog.json
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node jira-story-importer.js <config-file> <backlog-file>');
  process.exit(1);
}

const configFile = args[0];
const backlogFile = args[1];

let config, backlog;

try {
  config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  backlog = JSON.parse(fs.readFileSync(backlogFile, 'utf-8'));
  console.log('✅ Configuration and backlog loaded');
} catch (err) {
  console.error('❌ Error loading files:', err.message);
  process.exit(1);
}

// JIRA API Configuration
const jiraHost = new URL(config.jira.hostURL).hostname;
const projectKey = config.jira.projectKey;
const userEmail = config.jira.userEmail;
const apiToken = config.jira.apiToken;

// Base64 encode credentials for Basic Auth
const auth = Buffer.from(`${userEmail}:${apiToken}`).toString('base64');

/**
 * Make HTTPS request to JIRA API
 */
function jiraRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: jiraHost,
      port: 443,
      path: `/rest/api/3${path}`,
      method: method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (err) {
          reject(new Error(`Parse error: ${data}`));
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * Extract stories from backlog
 */
function extractStories() {
  const stories = [];

  // Phase 1 Sprint 1
  if (backlog.phase_1_sprint_1_backlog?.stories) {
    stories.push(...backlog.phase_1_sprint_1_backlog.stories.map(s => ({
      ...s,
      phase: 'phase1',
      sprint: 1
    })));
  }

  // Phase 1 Sprint 2
  if (backlog.phase_1_sprint_2_backlog?.stories) {
    stories.push(...backlog.phase_1_sprint_2_backlog.stories.map(s => ({
      ...s,
      phase: 'phase1',
      sprint: 2
    })));
  }

  // Phase 2 Sprint 3
  if (backlog.phase_2_sprint_3_backlog?.stories) {
    stories.push(...backlog.phase_2_sprint_3_backlog.stories.map(s => ({
      ...s,
      phase: 'phase2',
      sprint: 3
    })));
  }

  // Phase 2 Sprint 4
  if (backlog.phase_2_sprint_4_backlog?.stories) {
    stories.push(...backlog.phase_2_sprint_4_backlog.stories.map(s => ({
      ...s,
      phase: 'phase2',
      sprint: 4
    })));
  }

  // Phase 3
  if (backlog.phase_3_backlog?.stories) {
    stories.push(...backlog.phase_3_backlog.stories.map(s => ({
      ...s,
      phase: 'phase3',
      sprint: 5
    })));
  }

  return stories;
}

/**
 * Create a story in JIRA
 */
async function createStory(story, sprintId) {
  const labels = [
    story.phase,
    'ai-generated',
    story.complexity === 'HIGH' ? 'high-complexity' :
    story.complexity === 'MEDIUM' ? 'medium-complexity' : 'low-complexity',
    story.risk_level === 'HIGH' ? 'high-risk' :
    story.risk_level === 'MEDIUM' ? 'medium-risk' : 'low-risk'
  ].filter(Boolean);

  const payload = {
    fields: {
      project: {
        key: projectKey
      },
      issuetype: {
        name: 'Story'
      },
      summary: story.title,
      description: {
        version: 3,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: story.user_story || story.title
              }
            ]
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: `\nComplexity: ${story.complexity}\nRisk Level: ${story.risk_level}\nTechnical Notes: ${story.technical_notes || 'N/A'}`
              }
            ]
          }
        ]
      },
      customfield_10001: story.fibonacci_estimate, // Story Points (customize field ID)
      labels: labels,
      priority: {
        name: story.priority || 'Medium'
      }
    }
  };

  if (sprintId) {
    payload.fields.customfield_10005 = [sprintId]; // Sprint field (customize field ID)
  }

  try {
    const result = await jiraRequest('POST', '/issues', payload);
    console.log(`  ✅ Created story: ${result.key} - ${story.title}`);
    return result;
  } catch (err) {
    console.error(`  ❌ Error creating story: ${err.message}`);
    return null;
  }
}

/**
 * Create subtask for a story
 */
async function createSubtask(parentKey, subtaskTitle, estimateHours, labels = []) {
  const payload = {
    fields: {
      project: {
        key: projectKey
      },
      issuetype: {
        name: 'Sub-task'
      },
      parent: {
        key: parentKey
      },
      summary: subtaskTitle,
      labels: labels,
      customfield_10002: estimateHours // Effort (Hours) - customize field ID
    }
  };

  try {
    const result = await jiraRequest('POST', '/issues', payload);
    console.log(`    ✅ Created subtask: ${result.key}`);
    return result;
  } catch (err) {
    console.error(`    ❌ Error creating subtask: ${err.message}`);
    return null;
  }
}

/**
 * Get or create sprint
 */
async function getOrCreateSprint(sprintName, capacity) {
  try {
    // Get existing sprints
    const sprints = await jiraRequest('GET', `/board/${config.jira.boardID}/sprint`);

    const existing = sprints.values?.find(s => s.name === sprintName);
    if (existing) {
      console.log(`  ℹ️  Sprint ${sprintName} already exists (ID: ${existing.id})`);
      return existing.id;
    }

    // Create new sprint
    const payload = {
      name: sprintName,
      boardId: config.jira.boardID,
      goal: `Task Management Module - ${sprintName}`
    };

    const result = await jiraRequest('POST', `/sprint`, payload);
    console.log(`  ✅ Created sprint: ${sprintName} (ID: ${result.id})`);
    return result.id;
  } catch (err) {
    console.error(`  ❌ Error with sprint: ${err.message}`);
    return null;
  }
}

/**
 * Main import process
 */
async function importStories() {
  console.log('\n🚀 Starting JIRA Story Import...\n');
  console.log(`Project Key: ${projectKey}`);
  console.log(`Host: ${jiraHost}\n`);

  const stories = extractStories();
  console.log(`📊 Found ${stories.length} stories to import\n`);

  const sprints = {};
  let successCount = 0;
  let failureCount = 0;

  // Create sprints and stories by sprint
  for (const story of stories) {
    const sprintName = `Sprint ${story.sprint}: ${story.phase.toUpperCase()}`;

    // Get or create sprint
    if (!sprints[story.sprint]) {
      sprints[story.sprint] = await getOrCreateSprint(sprintName, 28 + (story.sprint - 1) * 2);
    }

    const sprintId = sprints[story.sprint];

    console.log(`\n📖 Story: ${story.id} (${story.fibonacci_estimate} SP)`);
    console.log(`   Title: ${story.title}`);

    // Create story
    const storyResult = await createStory(story, sprintId);
    if (storyResult) {
      successCount++;

      // Create subtasks
      if (story.effort_breakdown) {
        console.log(`   📝 Creating subtasks...`);
        for (const [task, hours] of Object.entries(story.effort_breakdown)) {
          if (typeof hours === 'number' || typeof hours === 'string') {
            const hourValue = typeof hours === 'string' ?
              parseInt(hours.split(' ')[0]) : hours;
            const taskLabel = task.split('_')[0].toLowerCase();

            await createSubtask(storyResult.key,
              `${task}: ${hours}`,
              hourValue,
              [taskLabel]);
          }
        }
      }
    } else {
      failureCount++;
    }
  }

  console.log(`\n✅ Import Complete!`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed: ${failureCount}`);
  console.log(`\n📌 Stories available at: https://${jiraHost}/browse/${projectKey}`);
}

// Run import
importStories().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
