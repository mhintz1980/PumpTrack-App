#!/usr/bin/env tsx
/**
 * Auto Test Generation Script
 * Triggered by file creation hooks to automatically generate tests
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { mkdirSync } from 'fs';

interface FileAnalysis {
  filePath: string;
  fileName: string;
  fileType: 'component' | 'utility' | 'service';
  exports: string[];
  imports: string[];
}

class TestGenerator {

  async generateTestsForFile(filePath: string): Promise<void> {
    console.log(`🧪 Auto-generating tests for: ${filePath}`);

    try {
      const analysis = await this.analyzeFile(filePath);
      const testContent = this.generateTestContent(analysis);
      const testFilePath = this.getTestFilePath(filePath);

      // Don't overwrite existing tests
      if (existsSync(testFilePath)) {
        console.log(`⚠️ Test file already exists: ${testFilePath}`);
        return;
      }

      await this.writeTestFile(testFilePath, testContent);
      console.log(`✅ Generated test file: ${testFilePath}`);

    } catch (error) {
      console.error(`❌ Failed to generate tests for ${filePath}:`, error);
    }
  }

  private async analyzeFile(filePath: string): Promise<FileAnalysis> {
    const content = readFileSync(filePath, 'utf8');
    const fileName = basename(filePath, extname(filePath));

    // Determine file type
    let fileType: 'component' | 'utility' | 'service';
    if (filePath.includes('/components/')) {
      fileType = 'component';
    } else if (filePath.includes('/utils/')) {
      fileType = 'utility';
    } else {
      fileType = 'service';
    }

    // Extract exports
    const exports = this.extractExports(content);
    const imports = this.extractImports(content);

    return {
      filePath,
      fileName,
      fileType,
      exports,
      imports
    };
  }

  private extractExports(content: string): string[] {
    const exports: string[] = [];

    // Function exports
    const functionMatches = content.match(/export\s+(function|const|async\s+function)\s+(\w+)/g) || [];
    functionMatches.forEach(match => {
      const nameMatch = match.match(/(\w+)$/);
      if (nameMatch) exports.push(nameMatch[1]);
    });

    // Component exports
    const componentMatches = content.match(/export\s+const\s+(\w+):\s*React\.FC/g) || [];
    componentMatches.forEach(match => {
      const nameMatch = match.match(/const\s+(\w+):/);
      if (nameMatch) exports.push(nameMatch[1]);
    });

    // Default exports
    const defaultMatch = content.match(/export\s+default\s+(\w+)/);
    if (defaultMatch) exports.push(defaultMatch[1]);

    return exports;
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importMatches = content.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/g) || [];

    importMatches.forEach(match => {
      const pathMatch = match.match(/from\s+['"]([^'"]+)['"]/);
      if (pathMatch) imports.push(pathMatch[1]);
    });

    return imports;
  }

  private generateTestContent(analysis: FileAnalysis): string {
    switch (analysis.fileType) {
      case 'component':
        return this.generateComponentTest(analysis);
      case 'utility':
        return this.generateUtilityTest(analysis);
      case 'service':
        return this.generateServiceTest(analysis);
      default:
        return this.generateGenericTest(analysis);
    }
  }

  private generateComponentTest(analysis: FileAnalysis): string {
    const componentName = analysis.exports[0] || analysis.fileName;
    const importPath = this.getImportPath(analysis.filePath);

    return `import { render, screen, fireEvent } from '@testing-library/react';
import { ${componentName} } from '${importPath}';

describe('${componentName}', () => {
  const defaultProps = {
    // TODO: Add default props based on component interface
  };

  beforeEach(() => {
    render(<${componentName} {...defaultProps} />);
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('renders with correct initial state', () => {
      // TODO: Add specific rendering tests
      expect(true).toBe(true);
    });
  });

  describe('User Interactions', () => {
    it('handles click events correctly', () => {
      // TODO: Add interaction tests
      expect(true).toBe(true);
    });

    it('handles form submissions correctly', () => {
      // TODO: Add form interaction tests if applicable
      expect(true).toBe(true);
    });
  });

  describe('Props Handling', () => {
    it('handles prop changes correctly', () => {
      // TODO: Add prop testing
      expect(true).toBe(true);
    });

    it('handles edge case props gracefully', () => {
      // TODO: Add edge case testing
      expect(true).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('handles errors gracefully', () => {
      // TODO: Add error boundary tests
      expect(true).toBe(true);
    });
  });
});`;
  }

  private generateUtilityTest(analysis: FileAnalysis): string {
    const functionName = analysis.exports[0] || analysis.fileName;
    const importPath = this.getImportPath(analysis.filePath);

    return `import { ${functionName} } from '${importPath}';

describe('${functionName}()', () => {
  describe('Basic Functionality', () => {
    it('returns expected output for valid input', () => {
      // TODO: Add basic functionality tests
      expect(true).toBe(true);
    });

    it('handles typical use cases correctly', () => {
      // TODO: Add typical use case tests
      expect(true).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty input gracefully', () => {
      // TODO: Add empty input tests
      expect(true).toBe(true);
    });

    it('handles invalid input gracefully', () => {
      // TODO: Add invalid input tests
      expect(true).toBe(true);
    });
  });

  describe('Properties', () => {
    it('does not mutate input parameters', () => {
      // TODO: Add immutability tests
      expect(true).toBe(true);
    });

    it('returns consistent results for same input', () => {
      // TODO: Add consistency tests
      expect(true).toBe(true);
    });
  });

  describe('Performance', () => {
    it('executes within acceptable time limits', () => {
      const start = performance.now();
      ${functionName}(/* TODO: Add test input */);
      const end = performance.now();
      expect(end - start).toBeLessThan(10); // 10ms threshold
    });
  });
});`;
  }

  private generateServiceTest(analysis: FileAnalysis): string {
    const serviceName = analysis.exports[0] || analysis.fileName;
    const importPath = this.getImportPath(analysis.filePath);

    return `import { ${serviceName} } from '${importPath}';

describe('${serviceName}', () => {
  beforeEach(() => {
    // Setup test environment
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after tests
  });

  describe('Success Cases', () => {
    it('handles successful operations correctly', async () => {
      // TODO: Add success case tests
      expect(true).toBe(true);
    });

    it('returns expected data format', async () => {
      // TODO: Add data format tests
      expect(true).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      // TODO: Add network error tests
      expect(true).toBe(true);
    });

    it('handles validation errors correctly', async () => {
      // TODO: Add validation error tests
      expect(true).toBe(true);
    });
  });

  describe('Integration', () => {
    it('integrates with external services correctly', async () => {
      // TODO: Add integration tests
      expect(true).toBe(true);
    });

    it('handles concurrent operations safely', async () => {
      // TODO: Add concurrency tests
      expect(true).toBe(true);
    });
  });
});`;
  }

  private generateGenericTest(analysis: FileAnalysis): string {
    const exportName = analysis.exports[0] || analysis.fileName;
    const importPath = this.getImportPath(analysis.filePath);

    return `import { ${exportName} } from '${importPath}';

describe('${exportName}', () => {
  it('should be defined', () => {
    expect(${exportName}).toBeDefined();
  });

  // TODO: Add specific tests based on functionality
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});`;
  }

  private getImportPath(filePath: string): string {
    // Convert file path to import path
    if (filePath.startsWith('src/')) {
      return '@/' + filePath.substring(4).replace(/\.(ts|tsx)$/, '');
    }
    return filePath.replace(/\.(ts|tsx)$/, '');
  }

  private getTestFilePath(filePath: string): string {
    const relativePath = filePath.replace(/^src\//, '');
    const testPath = relativePath.replace(/\.(ts|tsx)$/, '.spec.$1');
    return join('__tests__', testPath);
  }

  private async writeTestFile(testFilePath: string, content: string): Promise<void> {
    const dir = dirname(testFilePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(testFilePath, content, 'utf8');
  }
}

// CLI interface
async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('❌ Usage: tsx generate-tests.ts <file-path>');
    process.exit(1);
  }

  if (!existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const generator = new TestGenerator();
  await generator.generateTestsForFile(filePath);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { TestGenerator };