// scripts/run-agents.ts

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

// Find all spec files in /specs
const specsDir = join(process.cwd(), 'specs');
const specFiles = readdirSync(specsDir).filter(f => f.endsWith('.md'));

// Sort by mtime (most recent last)
const sorted = specFiles
  .map(f => ({
    file: f,
    mtime: require('fs').statSync(join(specsDir, f)).mtime.getTime(),
  }))
  .sort((a, b) => b.mtime - a.mtime);

// Pick the latest spec
const latest = sorted[0];

if (!latest) {
  console.error('No spec files found in /specs');
  process.exit(1);
}

const specContent = readFileSync(join(specsDir, latest.file), 'utf8');

// Parse Acceptance Criteria and Functional Requirements below
const acMatch = specContent.match(/Acceptance Criteria[^\n]*\n([\s\S]*?)(?:\n---|$)/i);
const frMatch = specContent.match(/Functional Requirements[^\n]*\n([\s\S]*?)(?:\n---|$)/i);

let agentPrompt = '';
if (acMatch) {
  agentPrompt += '## Acceptance Criteria\n' + acMatch[1].trim() + '\n\n';
}
if (frMatch) {
  agentPrompt += '## Functional Requirements\n' + frMatch[1].trim() + '\n\n';
}

console.log('\n----- Agent Prompt for Test-Designer -----\n');
console.log(agentPrompt || '(No prompt data found)');
