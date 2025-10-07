# Automated Release Workflow Guide

This guide explains how to use the automated CI/CD pipeline to publish min-pmt to npm.

## Overview

The release workflow automatically publishes to npm when you push a version tag. No manual publishing needed!

**Trigger**: Push a git tag matching `v*` (e.g., `v0.2.9`, `v1.0.0`)

**Actions**: The workflow will:
1. ✅ Run all tests
2. ✅ Run linter and format checks
3. ✅ Build all packages
4. ✅ Bundle CLI with Rolldown
5. ✅ Verify bundled CLI works
6. ✅ Publish to npm as `@cmwen/min-pmt`
7. ✅ Create GitHub Release with notes
8. ✅ Post success notification

## Prerequisites

### 1. NPM Token Setup

The workflow requires an NPM_TOKEN secret to publish.

**Create NPM Token:**
1. Login to [npmjs.com](https://www.npmjs.com/)
2. Go to [Access Tokens](https://www.npmjs.com/settings/YOUR_USERNAME/tokens)
3. Click "Generate New Token" → "Automation"
4. Copy the token

**Add to GitHub Secrets:**
1. Go to repository settings: https://github.com/cmwen/min-pmt/settings/secrets/actions
2. Click "New repository secret"
3. Name: `NPM_TOKEN`
4. Value: Paste your npm token
5. Click "Add secret"

### 2. Publishing Permissions

Ensure your npm account has publishing rights to the `@cmwen` scope:
```bash
npm access ls-packages @cmwen
```

## Quick Release Workflow

### Step 1: Update Version

Update version in `packages/cli/package.json`:

```bash
cd packages/cli

# For patch release (bug fixes)
npm version patch  # 0.2.8 → 0.2.9

# For minor release (new features)
npm version minor  # 0.2.8 → 0.3.0

# For major release (breaking changes)
npm version major  # 0.2.8 → 1.0.0
```

### Step 2: Update CHANGELOG

Edit `CHANGELOG.md` to document changes:

```markdown
## [0.2.9] - 2024-10-08

### Added
- New feature X
- New feature Y

### Fixed
- Bug fix Z

### Changed
- Improvement A
```

### Step 3: Commit Changes

```bash
cd ../..  # Back to root
git add packages/cli/package.json CHANGELOG.md
git commit -m "chore: Bump version to 0.2.9"
git push origin main
```

### Step 4: Create and Push Tag

```bash
# Create tag
git tag -a v0.2.9 -m "Release 0.2.9"

# Push tag - THIS TRIGGERS THE RELEASE!
git push origin v0.2.9
```

🎉 **Done!** The CI/CD pipeline will automatically:
- Build and test everything
- Bundle the CLI
- Publish to npm
- Create GitHub Release

## Monitoring the Release

### 1. Watch GitHub Actions

View the release progress:
```
https://github.com/cmwen/min-pmt/actions
```

Click on the workflow run to see detailed logs.

### 2. Check npm

After successful release:
```
https://www.npmjs.com/package/@cmwen/min-pmt
```

### 3. View GitHub Release

```
https://github.com/cmwen/min-pmt/releases
```

## Verify Release

Test the published package:

```bash
# Install and test
npx @cmwen/min-pmt@0.2.9 init
npx @cmwen/min-pmt@0.2.9 add "Test ticket"
npx @cmwen/min-pmt@0.2.9 list

# Check version
npx @cmwen/min-pmt@0.2.9 --version
```

## Complete Example

Here's a full release example:

```bash
# 1. Update version
cd packages/cli
npm version patch
cd ../..

# 2. Update CHANGELOG
vim CHANGELOG.md

# 3. Commit
git add packages/cli/package.json CHANGELOG.md
git commit -m "chore: Bump version to 0.2.9"
git push origin main

# 4. Wait for CI to pass on main
gh pr checks  # Or check Actions tab

# 5. Create and push tag
git tag -a v0.2.9 -m "Release 0.2.9"
git push origin v0.2.9

# 6. Watch the release workflow
gh run watch

# 7. Verify
npx @cmwen/min-pmt@0.2.9 --version
```

## Workflow Details

### What Gets Built

```
packages/cli/dist/bundled.js
```

This single file contains:
- Core ticket engine
- CLI commands
- Web UI server
- MCP server

### What Gets Published

Package: `@cmwen/min-pmt`
- `dist/bundled.js` - Single executable
- `package.json` - With dependencies
- `README.md` - User documentation
- `LICENSE` - MIT license

Dependencies installed from npm:
- `commander` - CLI framework
- `gray-matter` - YAML frontmatter parser

### GitHub Release

Automatically created with:
- Tag name (e.g., v0.2.9)
- Release notes from CHANGELOG
- Installation instructions
- Links to npm and documentation

## Troubleshooting

### Release Workflow Failed

**Check logs:**
```bash
gh run list --workflow=release.yml
gh run view <run-id>
```

**Common issues:**

1. **NPM_TOKEN not set or expired**
   - Solution: Update NPM_TOKEN in GitHub secrets

2. **Tests failing**
   - Solution: Fix tests before tagging
   - Run `pnpm test` locally first

3. **Version already published**
   - Solution: Bump to a new version
   - Delete the tag: `git tag -d v0.2.9 && git push origin :refs/tags/v0.2.9`
   - Create new tag with higher version

4. **Bundle failed**
   - Solution: Check Rolldown bundling
   - Test locally: `pnpm bundle:cli`

### Rollback a Release

If you need to rollback:

```bash
# Deprecate the version on npm
npm deprecate @cmwen/min-pmt@0.2.9 "This version has issues, use 0.2.10 instead"

# Or unpublish (within 72 hours)
npm unpublish @cmwen/min-pmt@0.2.9

# Delete GitHub release
gh release delete v0.2.9

# Delete tag
git tag -d v0.2.9
git push origin :refs/tags/v0.2.9
```

### Testing Release Workflow Locally

You can't trigger the release workflow locally, but you can test the steps:

```bash
# Run all checks
pnpm build
pnpm test
pnpm lint:ci

# Bundle CLI
pnpm bundle:cli

# Verify bundle
node packages/cli/dist/bundled.js --version

# Test publish (dry-run)
cd packages/cli
npm publish --dry-run
```

## Best Practices

### 1. Always Test on Main First

```bash
# Push to main
git push origin main

# Wait for CI to pass
gh run watch

# Then create tag
git tag -a v0.2.9 -m "Release 0.2.9"
git push origin v0.2.9
```

### 2. Use Semantic Versioning

- **Patch** (0.2.8 → 0.2.9): Bug fixes
- **Minor** (0.2.8 → 0.3.0): New features, backward compatible
- **Major** (0.2.8 → 1.0.0): Breaking changes

### 3. Update CHANGELOG Before Tagging

Users will see the CHANGELOG in GitHub releases.

### 4. Test Locally First

```bash
# Build and test
pnpm build && pnpm test

# Test bundle
pnpm bundle:cli
node packages/cli/dist/bundled.js init
```

### 5. Use Annotated Tags

```bash
# Good - annotated tag with message
git tag -a v0.2.9 -m "Release 0.2.9"

# Avoid - lightweight tag
git tag v0.2.9  # No message
```

## Continuous Deployment vs Manual

### Current Setup: Tag-Triggered CD

- ✅ **Pros**: Controlled releases, explicit versioning
- ✅ **Pros**: Review changes before release
- ✅ **Pros**: Can test on main before releasing

### Alternative: Auto-deploy on Main

If you want to auto-deploy every main commit:

```yaml
on:
  push:
    branches:
      - main
```

**Not recommended** because:
- Less control over when releases happen
- Every merge triggers a publish
- Harder to coordinate version numbers

## Release Checklist

Before pushing a tag:

- [ ] All tests passing on main
- [ ] Version bumped in package.json
- [ ] CHANGELOG.md updated
- [ ] Changes merged to main
- [ ] Main CI is green
- [ ] NPM_TOKEN secret is valid
- [ ] You have npm publishing permissions

After pushing tag:

- [ ] Release workflow succeeded
- [ ] Package visible on npmjs.com
- [ ] GitHub release created
- [ ] Tested installation: `npx @cmwen/min-pmt@VERSION init`
- [ ] Announce release (if needed)

## Getting Help

- **Workflow file**: `.github/workflows/release.yml`
- **Action logs**: https://github.com/cmwen/min-pmt/actions
- **npm package**: https://www.npmjs.com/package/@cmwen/min-pmt
- **Issues**: https://github.com/cmwen/min-pmt/issues

---

Last updated: 2025-10-07
