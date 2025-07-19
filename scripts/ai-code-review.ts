#!/usr/bin/env tsx
/**
 * AI-Powered Code Review Script
 * Automatically reviews code changes before commit
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

class AICodeReviewer {
  async reviewChanges(): Promise<void> {
    console.log('🤖 Starting AI code review...');
    
    try {
      // Get changed files
      const changedFiles = this.getChangedFiles();
      
      if (changedFiles.length === 0) {
        console.log('✅ No changes to review.');
        return;
      }
      
      console.log(`📝 Reviewing ${changedFiles.length} changed files...`);
      
      // Review each file
      for (const file of changedFiles) {
        await this.reviewFile(file);
      }
      
      console.log('✅ AI code review completed!');
      
    } catch (error) {
      console.error('❌ Error during code review:', error);
    }
  }
  
  private getChangedFiles(): string[] {
    try {
      const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
      return output
        .split('\n')
        .filter(file => file.trim() !== '')
        .filter(file => /\.(ts|tsx|js|jsx)$/.test(file));
    } catch (error) {
      console.error('Error getting changed files:', error);
      return [];
    }
  }
  
  private async reviewFile(filePath: string): Promise<void> {
    try {
      console.log(`🔍 Reviewing: ${filePath}`);
      
      // Get file diff
      const diff = execSync(`git diff --cached ${filePath}`, { encoding: 'utf8' });
      
      if (!diff) {
        console.log(`  ℹ️ No changes detected in ${filePath}`);
        return;
      }
      
      // Analyze code quality
      const issues = this.analyzeCodeQuality(filePath, diff);
      
      if (issues.length === 0) {
        console.log(`  ✅ No issues found in ${filePath}`);
        return;
      }
      
      // Report issues
      console.log(`  ⚠️ Found ${issues.length} potential issues in ${filePath}:`);
      issues.forEach((issue, index) => {
        console.log(`    ${index + 1}. ${issue}`);
      });
      
      // Generate suggestions
      const suggestions = this.generateSuggestions(filePath, diff, issues);
      console.log('  💡 Suggestions:');
      suggestions.forEach((suggestion, index) => {
        console.log(`    ${index + 1}. ${suggestion}`);
      });
      
      // Save review to file
      this.saveReview(filePath, issues, suggestions);
      
    } catch (error) {
      console.error(`Error reviewing ${filePath}:`, error);
    }
  }
  
  private analyzeCodeQuality(filePath: string, diff: string): string[] {
    const issues: string[] = [];
    
    // Check for common code smells
    if (diff.includes('TODO')) {
      issues.push('Contains TODO comments');
    }
    
    if (diff.includes('console.log')) {
      issues.push('Contains console.log statements');
    }
    
    if (diff.includes('any')) {
      issues.push('Uses "any" type - consider using more specific types');
    }
    
    if (diff.includes('!important')) {
      issues.push('Uses !important in CSS - consider refactoring');
    }
    
    // Check for potential security issues
    if (diff.includes('eval(')) {
      issues.push('Uses eval() - security risk');
    }
    
    if (diff.includes('innerHTML')) {
      issues.push('Uses innerHTML - potential XSS risk');
    }
    
    // Check for performance issues
    if (diff.match(/useEffect\(\s*\(\)\s*=>\s*{[^}]*}\s*\)/)) {
      issues.push('Empty dependency array in useEffect - may cause infinite loops');
    }
    
    return issues;
  }
  
  private generateSuggestions(filePath: string, diff: string, issues: string[]): string[] {
    const suggestions: string[] = [];
    
    // Generate suggestions based on issues
    if (issues.includes('Contains TODO comments')) {
      suggestions.push('Replace TODO comments with actual implementation or create GitHub issues');
    }
    
    if (issues.includes('Contains console.log statements')) {
      suggestions.push('Remove console.log statements before committing');
    }
    
    if (issues.includes('Uses "any" type - consider using more specific types')) {
      suggestions.push('Replace "any" with more specific types for better type safety');
    }
    
    // Add general suggestions
    suggestions.push('Consider adding JSDoc comments for public functions');
    suggestions.push('Ensure all React components have proper prop types');
    
    return suggestions;
  }
  
  private saveReview(filePath: string, issues: string[], suggestions: string[]): void {
    const reviewContent = `# AI Code Review: ${filePath}

## Issues Found
${issues.map(issue => `- ${issue}`).join('\n')}

## Suggestions
${suggestions.map(suggestion => `- ${suggestion}`).join('\n')}

Generated: ${new Date().toISOString()}
`;
    
    const reviewFilePath = `.kiro/reviews/${filePath.replace(/\//g, '_')}.md`;
    
    try {
      execSync(`mkdir -p ${require('path').dirname(reviewFilePath)}`, { stdio: 'ignore' });
      writeFileSync(reviewFilePath, reviewContent, 'utf8');
      console.log(`  📝 Review saved to ${reviewFilePath}`);
    } catch (error) {
      console.error(`Error saving review to ${reviewFilePath}:`, error);
    }
  }
}

// CLI interface
async function main() {
  const reviewer = new AICodeReviewer();
  await reviewer.reviewChanges();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { AICodeReviewer };