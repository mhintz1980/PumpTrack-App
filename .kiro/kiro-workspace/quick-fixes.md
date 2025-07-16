# Quick Fixes Checklist

## Immediate Actions (Can be done now)

### 1. Fix vitest.config.ts syntax error

```typescript
// Remove the extra closing brace at the end
// Current: },} 
// Should be: }
```

### 2. Enable TypeScript strict mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true  // Change from false to true
  }
}
```

### 3. Install missing testing dependencies

```bash
pnpm add -D playwright fast-check @faker-js/faker
```

### 4. Expand vitest coverage configuration

```typescript
// Include all src files, not just capitalize.ts
include: ['src/**/*.{ts,tsx}'],
exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'src/ai/dev.ts'],
```

### 5. Align package name

```json
// package.json
{
  "name": "pumptrack",  // Change from "nextn"
}
```

## Validation Commands

After fixes, run these to verify:

```bash
pnpm typecheck  # Should pass with strict mode
pnpm test       # Should run without syntax errors
pnpm lint       # Should pass
pnpm build      # Should build successfully
```

## Files to Create/Update

- [ ] Fix vitest.config.ts
- [ ] Update tsconfig.json
- [ ] Update package.json
- [ ] Install dependencies
- [ ] Create vitest.setup.ts if missing
- [ ] Add basic run-agents.ts structure

## Testing the Fixes

1. Run `pnpm install` after dependency changes
2. Run `pnpm check` to verify all checks pass
3. Run `pnpm coverage` to test coverage reporting
4. Verify TypeScript compilation with strict mode
