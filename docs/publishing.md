# Publishing Workflow

This document explains how to manage the dual package.json setup for local development vs publishing.

## Problem

In a monorepo, we want:
- **Local development**: Use `workspace:*` references for live dependency linking
- **Publishing**: Use actual version numbers for npm packages

## Solution

We use automated scripts to convert between the two states:

### Scripts

1. **`pnpm run publish:prepare`** - Converts `workspace:*` → actual versions
2. **`pnpm run publish:restore`** - Converts actual versions → `workspace:*`
3. **`node scripts/version-bump.js`** - Bump package versions

### Individual Package Publishing

```bash
# Bump version and publish CLI
node scripts/version-bump.js cli 0.2.6
pnpm run publish:cli

# Bump version and publish core
node scripts/version-bump.js core 0.1.1  
pnpm run publish:core

# Bump version and publish web
node scripts/version-bump.js web 0.1.1
pnpm run publish:web
```

### Publish All Packages

```bash
# Updates all package versions first, then publishes
pnpm run publish:all
```

## Current Package Versions

- `@cmwen/min-pmt-core`: 0.1.0
- `@cmwen/min-pmt-web`: 0.1.0  
- `@cmwen/min-pmt`: 0.2.5

## Workflow Steps

### 1. Development (Normal State)

```json
"dependencies": {
  "@cmwen/min-pmt-core": "workspace:*"
}
```

✅ Local linking works  
✅ Tests pass  
✅ Development builds work  

### 2. Publishing Preparation

```bash
pnpm run publish:prepare
```

This converts package.json files to:

```json
"dependencies": {
  "@cmwen/min-pmt-core": "^0.1.0"
}
```

✅ Ready for npm publish  
✅ Dependencies resolve to published packages  

### 3. Publishing

```bash
cd packages/cli && npm publish
```

✅ Package published to npm  
✅ npx commands work  

### 4. Restore Development State

```bash
pnpm run publish:restore
```

This reverts package.json files back to:

```json
"dependencies": {
  "@cmwen/min-pmt-core": "workspace:*"
}
```

✅ Back to development state  
✅ Local linking restored  

## Error Recovery

If something goes wrong during publishing:

```bash
# Restore workspace references
pnpm run publish:restore

# Verify everything works
pnpm build
pnpm test
```

## Best Practices

1. **Always restore after publishing** to keep the repo in development state
2. **Test locally first** before publishing
3. **Bump versions appropriately** (patch/minor/major)
4. **Update version mappings** in `scripts/prepare-publish.js` when needed

## Example: Publishing a CLI Bug Fix

```bash
# 1. Make your changes and test
pnpm build
pnpm test

# 2. Bump version 
node scripts/version-bump.js cli 0.2.6

# 3. Publish
pnpm run publish:cli

# 4. Test the published version
npx @cmwen/min-pmt@0.2.6 --help

# Done! The repo is automatically back in development state.
```
