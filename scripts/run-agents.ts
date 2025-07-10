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
console.log(`Loaded spec: ${latest.file}\n---\n${specContent.slice(0, 400)}...\n`);

// TODO: Pass specContent to test-designer agent for test generation
