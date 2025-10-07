# Publishing Guide

This guide explains how to publish min-pmt as a single npm module under the `@cmwen` scope.

## Publishing Model

**Single-Module Publishing**: Only the CLI package (`@cmwen/min-pmt`) is published to npm. It bundles all functionality from core, web, and MCP packages into a single executable file.

### Why Single-Module?

1. **Simplicity**: Users only need to install one package
2. **Speed**: Bundled with Rolldown for fast execution
3. **Dependencies**: Minimal runtime deps (commander, gray-matter)
4. **Distribution**: Single file is easier to distribute and cache

## Prerequisites

1. **npm Account**: Must be logged in with access to `@cmwen` scope
   ```bash
   npm login
   npm whoami  # Verify login
   ```

2. **Clean Working Directory**: Commit or stash all changes
   ```bash
   git status
   ```

3. **Passing Tests**: All quality gates must pass
   ```bash
   pnpm build && pnpm test
   ```

## Quick Publish

### Using the Publishing Script (Recommended)

```bash
# Dry run first (recommended)
pnpm release:dry-run

# Actual publish
pnpm release
```

The script will:
1. ✅ Check prerequisites
2. ✅ Run tests
3. ✅ Run linter
4. ✅ Build all packages
5. ✅ Bundle CLI
6. ✅ Verify bundled CLI works
7. ✅ Show package info
8. ✅ Publish to npm
9. ✅ Create git tag

### Manual Publishing

```bash
# 1. Build and test
pnpm build
pnpm test

# 2. Bundle CLI
cd packages/cli
pnpm run build:bundle

# 3. Verify bundle works
node dist/bundled.js --version

# 4. Publish
npm publish

# 5. Tag release
cd ../..
git tag -a v0.2.8 -m "Release 0.2.8"
git push origin v0.2.8
```

## Version Management

### Semantic Versioning

Follow [SemVer](https://semver.org/):
- **MAJOR**: Breaking changes (e.g., 1.0.0 → 2.0.0)
- **MINOR**: New features, backward compatible (e.g., 1.0.0 → 1.1.0)
- **PATCH**: Bug fixes, backward compatible (e.g., 1.0.0 → 1.0.1)

### Updating Version

Update version in `packages/cli/package.json`:

```bash
# Patch release (0.2.8 → 0.2.9)
cd packages/cli
npm version patch

# Minor release (0.2.8 → 0.3.0)
npm version minor

# Major release (0.2.8 → 1.0.0)
npm version major
```

## Pre-Publishing Checklist

- [ ] All tests passing (`pnpm test`)
- [ ] Linter clean (`pnpm lint:ci`)
- [ ] Build successful (`pnpm build`)
- [ ] Bundle works (`pnpm bundle:cli && node packages/cli/dist/bundled.js --help`)
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Git working directory clean
- [ ] Logged into npm with correct account

## Post-Publishing Checklist

- [ ] Git tag created and pushed (`git push origin v0.2.8`)
- [ ] GitHub release created
- [ ] Test installation: `npx @cmwen/min-pmt@latest init`
- [ ] Verify commands work from published package
- [ ] Update documentation if needed

## Publishing Workflow

### 1. Prepare Release

```bash
# Update CHANGELOG.md
vim CHANGELOG.md

# Bump version
cd packages/cli
npm version patch  # or minor/major
cd ../..

# Commit version bump
git add .
git commit -m "chore: Bump version to 0.2.9"
git push
```

### 2. Test Locally

```bash
# Run full test suite
pnpm build && pnpm test

# Test bundled CLI
pnpm bundle:cli
node packages/cli/dist/bundled.js init
```

### 3. Dry Run

```bash
# Verify everything works without publishing
pnpm release:dry-run
```

### 4. Publish

```bash
# Real publish
pnpm release

# Or manual
cd packages/cli
npm publish
```

### 5. Create GitHub Release

```bash
# Push tag
git push origin v0.2.9

# Create release on GitHub
# Visit: https://github.com/cmwen/min-pmt/releases/new
# - Choose tag: v0.2.9
# - Title: v0.2.9
# - Description: Copy from CHANGELOG.md
```

### 6. Verify

```bash
# Test installation from npm
npx @cmwen/min-pmt@0.2.9 init

# Test commands
npx @cmwen/min-pmt@0.2.9 add "Test ticket"
npx @cmwen/min-pmt@0.2.9 list
```

## Troubleshooting

### "You do not have permission to publish"

Ensure you're logged in and have access to `@cmwen` scope:
```bash
npm login
npm whoami
npm access ls-packages @cmwen
```

### "Version already exists"

You tried to publish a version that's already on npm:
```bash
# Check current published version
npm view @cmwen/min-pmt version

# Bump to new version
cd packages/cli
npm version patch
```

### "Bundled CLI doesn't work"

The bundle might be broken:
```bash
# Rebuild everything
pnpm clean
pnpm install
pnpm build
pnpm bundle:cli

# Test bundle
node packages/cli/dist/bundled.js --version
```

### "Tests failing"

Don't publish with failing tests:
```bash
# Run tests
pnpm test

# Check specific package
cd packages/cli
pnpm test
```

## CI/CD Integration

### Automated Publishing (Future)

The release workflow (`.github/workflows/release.yml`) can automatically publish when you push a version tag:

```bash
# Create and push tag
git tag -a v0.2.9 -m "Release 0.2.9"
git push origin v0.2.9

# GitHub Actions will:
# 1. Run tests
# 2. Build packages
# 3. Bundle CLI
# 4. Publish to npm (requires NPM_TOKEN secret)
```

### Setting up NPM_TOKEN

1. Create npm token: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Add to GitHub secrets: https://github.com/cmwen/min-pmt/settings/secrets/actions
3. Name it: `NPM_TOKEN`
4. Type: Automation token

## Package Structure

What gets published:

```
@cmwen/min-pmt/
├── dist/
│   └── bundled.js          # Single executable file
├── package.json            # Dependencies: commander, gray-matter
├── README.md              # User documentation
└── LICENSE                # MIT License
```

What's NOT published:
- TypeScript source files
- Test files
- Dev dependencies
- Other packages (core, web, mcp)

## Verification After Publishing

```bash
# Install globally
npm install -g @cmwen/min-pmt@latest

# Test commands
min-pmt --version
min-pmt --help
mkdir test-project && cd test-project
min-pmt init
min-pmt add "Test ticket"
min-pmt list

# Clean up
cd ..
rm -rf test-project
npm uninstall -g @cmwen/min-pmt
```

## Rollback

If you need to unpublish (within 72 hours):

```bash
# Unpublish specific version
npm unpublish @cmwen/min-pmt@0.2.9

# Deprecate version (better than unpublishing)
npm deprecate @cmwen/min-pmt@0.2.9 "This version has issues, use 0.2.10 instead"
```

## Support

For issues with publishing:
- Check [npm documentation](https://docs.npmjs.com/)
- Review [GitHub Actions logs](https://github.com/cmwen/min-pmt/actions)
- Open an issue: https://github.com/cmwen/min-pmt/issues

---

Last updated: 2025-10-07
