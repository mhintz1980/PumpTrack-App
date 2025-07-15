// scripts/run-agents.ts

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config({ path: '.env.local' });
 
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function createFeatureSpec(naturalLanguageRequest: string): Promise<string> {
  const systemPrompt = `
You are a senior software engineer.
Given a plain-English feature request, output a markdown Feature Specification using this template:

# Feature Specification: [Feature Name]

**slug:** [slug]
**Status:** Draft
**Date:** [today]
**Author:** AI Agent

## 1. Overview
[Short description]

## 2. User Stories
- As a [role], I want [action] so that [benefit].

### 2.1 Acceptance Criteria
- [criteria, each as a single line]

## 3. Functional Requirements
- FR-1 The function SHALL ...
- FR-2 The function SHALL ...
- FR-3 The function SHALL NOT ...
---
Only output the markdown. No prose, notes, or commentary.
`;

  const userPrompt = `Request: ${naturalLanguageRequest}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    max_tokens: 1200,
    temperature: 0.2
  });

  return completion.choices[0].message.content || '';
}

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

(async () => {
  const request = process.argv.slice(2).join(' ') || "A function that reverses a string";
  console.log("Generating feature spec for request:", request);

  const spec = await createFeatureSpec(request);
  const specsDir = join(process.cwd(), 'specs');
  const fileName = `${request.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-feature.md`;
  const filePath = join(specsDir, fileName);

  writeFileSync(filePath, spec, 'utf-8');
  console.log(`\nSaved feature spec to ${filePath}\n`);
  console.log(spec);
})();

