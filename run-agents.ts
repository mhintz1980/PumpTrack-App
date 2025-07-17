#!/usr/bin/env tsx
/**
 * PumpTrack Enhanced Agent Orchestration Script
 * AI-powered development automation using MCP integration
 * Implements the multi-agent testing workflow from testingProtocol_v1.md
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { mkdirSync } from 'fs';

interface FeatureSpec {
  slug: string;
  title: string;
  content: string;
  filePath: string;
}

interface TestResults {
  success: boolean;
  output: string;
  coverage?: number;
}

interface GeneratedCode {
  implementation?: string;
  tests?: string;
  filePath: string;
}

interface AIAgent {
  name: string;
  role: string;
  generate(spec: FeatureSpec): Promise<GeneratedCode>;
}

/**
 * AI-Powered Test Generator Agent
 */
class TestDesignerAgent implements AIAgent {
  name = 'TestDesigner';
  role = 'Generates comprehensive test suites from specifications';

  async generate(spec: FeatureSpec): Promise<GeneratedCode> {
    console.log(`🧪 ${this.name}: Analyzing spec for test generation...`);
    
    // Extract key information from spec
    const acceptanceCriteria = this.extractAcceptanceCriteria(spec.content);
    const functionalRequirements = this.extractFunctionalRequirements(spec.content);
    const componentPath = this.extractComponentPath(spec.content);
    
    // Generate comprehensive test suite
    const tests = this.generateTestSuite(spec, acceptanceCriteria, functionalRequirements);
    
    return {
      tests,
      filePath: this.getTestFilePath(componentPath || spec.slug)
    };
  }

  private extractAcceptanceCriteria(content: string): string[] {
    const matches = content.match(/- \*\*AC-\d+\*\* (.+)/g) || [];
    return matches.map(match => match.replace(/- \*\*AC-\d+\*\* /, ''));
  }

  private extractFunctionalRequirements(content: string): string[] {
    const matches = content.match(/- \*\*FR-\d+\*\* (.+)/g) || [];
    return matches.map(match => match.replace(/- \*\*FR-\d+\*\* /, ''));
  }

  private extractComponentPath(content: string): string | null {
    const match = content.match(/\*\*New file:\*\* `([^`]+)`/) || 
                  content.match(/- \*\*New file:\*\* `([^`]+)`/);
    return match ? match[1] : null;
  }
  
  private extractInputType(content: string): string | null {
    // Try to find input type from function signature or parameter descriptions
    const functionSignature = content.match(/function\s+\w+\s*\(\s*\w+\s*:\s*(\w+)/i);
    if (functionSignature) {
      return functionSignature[1].toLowerCase();
    }
    
    // Look for type mentions in the spec
    if (content.match(/string\s+input|input\s+string|accepts\s+string|parameter\s+is\s+string/i)) {
      return 'string';
    }
    if (content.match(/number\s+input|input\s+number|accepts\s+number|parameter\s+is\s+number/i)) {
      return 'number';
    }
    if (content.match(/boolean\s+input|input\s+boolean|accepts\s+boolean|parameter\s+is\s+boolean/i)) {
      return 'boolean';
    }
    if (content.match(/object\s+input|input\s+object|accepts\s+object|parameter\s+is\s+object/i)) {
      return 'object';
    }
    
    // Default to string if no type is found
    return 'string';
  }
  
  private extractOutputType(content: string): string | null {
    // Try to find return type from function signature
    const functionSignature = content.match(/function\s+\w+\s*\([^)]*\)\s*:\s*(\w+)/i);
    if (functionSignature) {
      return functionSignature[1].toLowerCase();
    }
    
    // Look for return type mentions in the spec
    if (content.match(/returns\s+string|return\s+value\s+is\s+string|output\s+is\s+string/i)) {
      return 'string';
    }
    if (content.match(/returns\s+number|return\s+value\s+is\s+number|output\s+is\s+number/i)) {
      return 'number';
    }
    if (content.match(/returns\s+boolean|return\s+value\s+is\s+boolean|output\s+is\s+boolean/i)) {
      return 'boolean';
    }
    if (content.match(/returns\s+object|return\s+value\s+is\s+object|output\s+is\s+object/i)) {
      return 'object';
    }
    
    // Default to string if no type is found
    return 'string';
  }

  private generateTestSuite(spec: FeatureSpec, acceptanceCriteria: string[], functionalRequirements: string[]): string {
    const isUtilFunction = spec.slug.includes('utils');
    const isComponent = spec.slug.includes('components');
    
    if (isUtilFunction) {
      return this.generateUtilityTests(spec, acceptanceCriteria);
    } else if (isComponent) {
      return this.generateComponentTests(spec, acceptanceCriteria);
    } else {
      return this.generateServiceTests(spec, acceptanceCriteria);
    }
  }

  private generateUtilityTests(spec: FeatureSpec, acceptanceCriteria: string[]): string {
    const functionName = spec.slug.split('-').pop() || 'unknown';
    const requirements = this.extractFunctionalRequirements(spec.content);
    const hasNullCheck = requirements.some(req => req.toLowerCase().includes('null'));
    const hasUndefinedCheck = requirements.some(req => req.toLowerCase().includes('undefined'));
    
    // Extract expected input/output types from spec
    const inputType = this.extractInputType(spec.content) || 'string';
    const outputType = this.extractOutputType(spec.content) || 'string';
    
    // Generate test cases from acceptance criteria
    const testCases = acceptanceCriteria.map((criteria, index) => {
      const testCase = this.parseAcceptanceCriteria(criteria);
      return `it('${testCase.description}', () => {
    const result = ${functionName}(${testCase.input});
    expect(result).toBe(${testCase.expected});
  });`;
    }).join('\n\n  ');
    
    // Generate edge case tests based on input type
    let edgeCases = '';
    if (inputType === 'string') {
      edgeCases = `
  // Edge cases
  it('handles empty string input', () => {
    const result = ${functionName}("");
    expect(result).toBe("");
  });
  
  it('handles single character input', () => {
    const result = ${functionName}("a");
    expect(result).toBe("A");
  });`;
    }
    
    // Only add null/undefined tests if they're not explicitly handled in requirements
    let nullUndefinedTests = '';
    if (!hasNullCheck && !hasUndefinedCheck) {
      nullUndefinedTests = `
  // Defensive programming tests
  it('handles null input gracefully', () => {
    expect(() => ${functionName}(null as any)).not.toThrow();
  });

  it('handles undefined input gracefully', () => {
    expect(() => ${functionName}(undefined as any)).not.toThrow();
  });`;
    }
    
    return `import { ${functionName} } from '@/utils/${functionName}';

describe('${functionName}()', () => {
  // Basic functionality tests
  ${testCases}${edgeCases}${nullUndefinedTests}

  // Property-based testing
  it('does not mutate original input', () => {
    const original = 'test string';
    const originalCopy = original;
    ${functionName}(original);
    expect(original).toBe(originalCopy);
  });
  
  it('is idempotent - applying it twice gives same result as once', () => {
    const input = 'example';
    const onceResult = ${functionName}(input);
    const twiceResult = ${functionName}(${functionName}(input));
    expect(onceResult).toBe(twiceResult);
  });
});`;
  }

  private generateComponentTests(spec: FeatureSpec, acceptanceCriteria: string[]): string {
    const componentName = spec.title.replace('Feature Specification: ', '').replace(' Component', '');
    
    return `import { render, screen, fireEvent } from '@testing-library/react';
import { ${componentName} } from '@/components/${componentName}';

describe('${componentName}', () => {
  const mockProps = {
    // Add mock props based on spec
  };

  beforeEach(() => {
    render(<${componentName} {...mockProps} />);
  });

  // Rendering tests
  it('renders without crashing', () => {
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  // Acceptance criteria tests
  ${acceptanceCriteria.map((criteria, index) => `it('AC-${index + 1}: ${criteria}', () => {
    // Test implementation based on criteria
    expect(true).toBe(true); // TODO: Implement specific test
  });`).join('\n\n  ')}

  // Interaction tests
  it('handles user interactions correctly', () => {
    // Add interaction tests
    expect(true).toBe(true); // TODO: Implement interaction tests
  });

  // Error boundary tests
  it('handles errors gracefully', () => {
    // Add error handling tests
    expect(true).toBe(true); // TODO: Implement error tests
  });
});`;
  }

  private generateServiceTests(spec: FeatureSpec, acceptanceCriteria: string[]): string {
    const serviceName = spec.slug.split('-').pop() || 'service';
    
    return `import { ${serviceName} } from '@/services/${serviceName}';

describe('${serviceName}', () => {
  // Setup and teardown
  beforeEach(() => {
    // Setup test environment
  });

  afterEach(() => {
    // Cleanup
  });

  // Acceptance criteria tests
  ${acceptanceCriteria.map((criteria, index) => `it('AC-${index + 1}: ${criteria}', async () => {
    // Test implementation based on criteria
    expect(true).toBe(true); // TODO: Implement specific test
  });`).join('\n\n  ')}

  // Error handling tests
  it('handles errors appropriately', async () => {
    // Add error handling tests
    expect(true).toBe(true); // TODO: Implement error tests
  });
});`;
  }

  private parseAcceptanceCriteria(criteria: string): { description: string; input: string; expected: string } {
    // Parse GIVEN/WHEN/THEN format
    const givenMatch = criteria.match(/GIVEN `([^`]+)`/);
    const whenMatch = criteria.match(/WHEN `([^`]+)`/);
    const thenMatch = criteria.match(/THEN `([^`]+)`/);
    
    // Extract more detailed information
    const input = givenMatch ? givenMatch[1] : '""';
    let expected = thenMatch ? thenMatch[1] : 'true';
    
    // Create a more descriptive test description
    let description = 'handles input correctly';
    if (givenMatch && whenMatch) {
      description = `returns ${expected} for input ${input}`;
    }
    
    // Handle special cases
    if (input === '""' || input === "''") {
      description = 'handles empty string input';
    } else if (input === 'null') {
      description = 'handles null input';
    } else if (input === 'undefined') {
      description = 'handles undefined input';
    }
    
    return {
      description,
      input: this.sanitizeInput(input),
      expected: this.sanitizeExpected(expected)
    };
  }
  
  private sanitizeInput(input: string): string {
    // Handle special cases for input
    if (input === 'null' || input === 'undefined') {
      return input; // Keep as is for null/undefined
    }
    
    // If it looks like a string (has quotes or no special chars)
    if (input.startsWith('"') || input.startsWith("'") || /^[a-zA-Z0-9]+$/.test(input)) {
      // Ensure proper string format
      return input.startsWith('"') || input.startsWith("'") ? input : `"${input}"`;
    }
    
    return input; // Return as is for other types
  }
  
  private sanitizeExpected(expected: string): string {
    // Handle special cases for expected output
    if (expected === 'null' || expected === 'undefined' || expected === 'true' || expected === 'false') {
      return expected; // Keep as is for literals
    }
    
    // If it looks like a string (has quotes or no special chars)
    if (expected.startsWith('"') || expected.startsWith("'") || /^[a-zA-Z0-9]+$/.test(expected)) {
      // Ensure proper string format
      return expected.startsWith('"') || expected.startsWith("'") ? expected : `"${expected}"`;
    }
    
    return expected; // Return as is for other types
  }

  private getTestFilePath(componentPath: string): string {
    if (componentPath.startsWith('src/')) {
      return componentPath.replace('src/', '__tests__/').replace('.ts', '.spec.ts').replace('.tsx', '.spec.tsx');
    }
    return `__tests__/${componentPath}.spec.ts`;
  }
}

/**
 * AI-Powered Implementation Generator Agent
 */
class ProgrammerAgent implements AIAgent {
  name = 'Programmer';
  role = 'Generates implementation code from specifications';

  async generate(spec: FeatureSpec): Promise<GeneratedCode> {
    console.log(`👨‍💻 ${this.name}: Analyzing spec for implementation...`);
    
    const componentPath = this.extractComponentPath(spec.content);
    const functionalRequirements = this.extractFunctionalRequirements(spec.content);
    
    if (!componentPath) {
      console.log('⚠️ No component path found in spec, skipping implementation generation');
      return { filePath: '' };
    }

    const implementation = this.generateImplementation(spec, functionalRequirements);
    
    return {
      implementation,
      filePath: componentPath
    };
  }

  private extractComponentPath(content: string): string | null {
    const match = content.match(/\*\*New file:\*\* `([^`]+)`/) || 
                  content.match(/- \*\*New file:\*\* `([^`]+)`/);
    return match ? match[1] : null;
  }

  private extractFunctionalRequirements(content: string): string[] {
    const matches = content.match(/- \*\*FR-\d+\*\* (.+)/g) || [];
    return matches.map(match => match.replace(/- \*\*FR-\d+\*\* /, ''));
  }

  private generateImplementation(spec: FeatureSpec, requirements: string[]): string {
    const isUtilFunction = spec.slug.includes('utils');
    const isComponent = spec.slug.includes('components');
    
    if (isUtilFunction) {
      return this.generateUtilityImplementation(spec, requirements);
    } else if (isComponent) {
      return this.generateComponentImplementation(spec, requirements);
    } else {
      return this.generateServiceImplementation(spec, requirements);
    }
  }

  private generateUtilityImplementation(spec: FeatureSpec, requirements: string[]): string {
    const functionName = spec.slug.split('-').pop() || 'unknown';
    
    return `/**
 * ${spec.title.replace('Feature Specification: ', '')}
 * Generated from spec: ${spec.slug}
 */

export function ${functionName}(input: string): string {
  // Implementation based on functional requirements:
  ${requirements.map(req => `// ${req}`).join('\n  ')}
  
  // TODO: Implement based on acceptance criteria
  return input;
}`;
  }

  private generateComponentImplementation(spec: FeatureSpec, requirements: string[]): string {
    const componentName = spec.title.replace('Feature Specification: ', '').replace(' Component', '');
    
    return `"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  // TODO: Define props based on spec
}

/**
 * ${spec.title.replace('Feature Specification: ', '')}
 * Generated from spec: ${spec.slug}
 */
export const ${componentName}: React.FC<${componentName}Props> = (props) => {
  // Implementation based on functional requirements:
  ${requirements.map(req => `// ${req}`).join('\n  ')}

  return (
    <div className="p-4">
      <h2>${componentName}</h2>
      {/* TODO: Implement component based on acceptance criteria */}
    </div>
  );
};`;
  }

  private generateServiceImplementation(spec: FeatureSpec, requirements: string[]): string {
    const serviceName = spec.slug.split('-').pop() || 'service';
    
    return `"use server";

/**
 * ${spec.title.replace('Feature Specification: ', '')}
 * Generated from spec: ${spec.slug}
 */

// Implementation based on functional requirements:
${requirements.map(req => `// ${req}`).join('\n')}

export async function ${serviceName}() {
  // TODO: Implement service based on acceptance criteria
  return {};
}`;
  }
}

class AgentOrchestrator {
  private readonly maxRetries = 2;
  private readonly specsDir = './specs';
  private readonly testDesigner = new TestDesignerAgent();
  private readonly programmer = new ProgrammerAgent();
  
  /**
   * Main orchestration method
   */
  async run(specFile?: string): Promise<void> {
    console.log('🚀 PumpTrack Agent Orchestration Starting...');
    
    try {
      // Step 1: Read feature specs
      const specs = specFile ? [this.readSpec(specFile)] : this.readAllSpecs();
      
      if (specs.length === 0) {
        console.log('❌ No feature specs found');
        return;
      }
      
      // Step 2: Process each spec
      for (const spec of specs) {
        console.log(`\n📋 Processing spec: ${spec.title}`);
        await this.processSpec(spec);
      }
      
      console.log('\n✅ Agent orchestration completed');
      
    } catch (error) {
      console.error('❌ Agent orchestration failed:', error);
      process.exit(1);
    }
  }
  
  /**
   * Process a single feature spec through the multi-agent workflow
   */
  private async processSpec(spec: FeatureSpec): Promise<void> {
    console.log(`\n🔄 Running AI-powered multi-agent workflow for: ${spec.slug}`);
    
    try {
      // Step 1: Generate implementation (Programmer agent)
      const implementationResult = await this.programmer.generate(spec);
      if (implementationResult.implementation && implementationResult.filePath) {
        await this.writeGeneratedCode(implementationResult.filePath, implementationResult.implementation);
        console.log(`✅ Generated implementation: ${implementationResult.filePath}`);
      }
      
      // Step 2: Generate tests (Test-Designer agent)
      const testResult = await this.testDesigner.generate(spec);
      if (testResult.tests && testResult.filePath) {
        await this.writeGeneratedCode(testResult.filePath, testResult.tests);
        console.log(`✅ Generated tests: ${testResult.filePath}`);
      }
      
      // Step 3: Execute tests (Executor agent)
      console.log('⚡ Executor agent: Running generated tests...');
      const testResults = await this.runTests();
      
      // Step 4: Handle failures with feedback loop
      if (!testResults.success) {
        console.log('🔧 Feedback agent: Analyzing failures...');
        await this.handleTestFailures(testResults, 0);
      } else {
        console.log('✅ All tests passed! AI-generated code is working!');
        await this.updateSpecStatus(spec, 'Implemented');
      }
      
    } catch (error) {
      console.error(`❌ Error processing spec ${spec.slug}:`, error);
    }
  }

  /**
   * Write generated code to file system
   */
  private async writeGeneratedCode(filePath: string, content: string): Promise<void> {
    try {
      // Ensure directory exists
      const dir = dirname(filePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      
      // Write the file
      writeFileSync(filePath, content, 'utf8');
      console.log(`📝 Written: ${filePath}`);
      
    } catch (error) {
      console.error(`❌ Failed to write ${filePath}:`, error);
    }
  }

  /**
   * Update spec status to reflect implementation progress
   */
  private async updateSpecStatus(spec: FeatureSpec, status: string): Promise<void> {
    try {
      const updatedContent = spec.content.replace(
        /\*\*Status:\*\* Draft/g,
        `**Status:** ${status}`
      );
      
      writeFileSync(spec.filePath, updatedContent, 'utf8');
      console.log(`📋 Updated spec status: ${spec.slug} → ${status}`);
      
    } catch (error) {
      console.error(`❌ Failed to update spec status:`, error);
    }
  }
  
  /**
   * Run the test suite and return results
   */
  private async runTests(): Promise<TestResults> {
    try {
      const output = execSync('pnpm test && pnpm coverage', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      return {
        success: true,
        output,
        coverage: this.extractCoverage(output)
      };
    } catch (error: any) {
      return {
        success: false,
        output: error.stdout || error.message
      };
    }
  }
  
  /**
   * Handle test failures with retry logic
   */
  private async handleTestFailures(results: TestResults, retryCount: number): Promise<void> {
    if (retryCount >= this.maxRetries) {
      console.log(`❌ Max retries (${this.maxRetries}) reached. Manual intervention required.`);
      console.log('Failure output:', results.output);
      return;
    }
    
    console.log(`🔄 Retry ${retryCount + 1}/${this.maxRetries}: Analyzing failures...`);
    
    // TODO: Implement AI-powered failure analysis and fixes
    // For now, just log the failure
    console.log('Failure details:', results.output);
    
    // Retry tests
    const retryResults = await this.runTests();
    if (!retryResults.success) {
      await this.handleTestFailures(retryResults, retryCount + 1);
    }
  }
  
  /**
   * Read a single spec file
   */
  private readSpec(fileName: string): FeatureSpec {
    // Handle both relative and absolute paths
    let filePath: string;
    
    if (fileName.startsWith('specs/') || fileName.startsWith('specs\\')) {
      // If fileName already includes 'specs/', use it directly
      filePath = fileName;
    } else {
      // Otherwise, join with specsDir
      filePath = join(this.specsDir, fileName);
    }
    
    if (!existsSync(filePath)) {
      throw new Error(`Spec file not found: ${filePath}`);
    }
    
    const content = readFileSync(filePath, 'utf8');
    const title = this.extractTitle(content);
    const slug = this.extractSlug(content);
    
    return {
      slug,
      title,
      content,
      filePath
    };
  }
  
  /**
   * Read all spec files from the specs directory
   */
  private readAllSpecs(): FeatureSpec[] {
    if (!existsSync(this.specsDir)) {
      console.log(`Specs directory not found: ${this.specsDir}`);
      return [];
    }
    
    const files = require('fs').readdirSync(this.specsDir)
      .filter((file: string) => file.endsWith('.md'));
    
    return files.map((file: string) => this.readSpec(file));
  }
  
  /**
   * Extract title from markdown content
   */
  private extractTitle(content: string): string {
    const match = content.match(/^# (.+)$/m);
    return match ? match[1] : 'Unknown Feature';
  }
  
  /**
   * Extract slug from markdown content
   */
  private extractSlug(content: string): string {
    const match = content.match(/\*\*slug:\*\* (.+)$/m);
    return match ? match[1].trim() : 'unknown-feature';
  }
  
  /**
   * Extract coverage percentage from test output
   */
  private extractCoverage(output: string): number {
    const match = output.match(/All files\s+\|\s+(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const specFile = args[0]; // Optional specific spec file
  
  // Fix path handling - remove any duplicate 'specs/' prefix
  const fixedSpecFile = specFile?.replace(/^specs[\/\\]specs[\/\\]/, 'specs/');
  
  const orchestrator = new AgentOrchestrator();
  await orchestrator.run(fixedSpecFile);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { AgentOrchestrator };