# CI/CD Setup Guide

Quick guide to set up automated releases for min-pmt.

## One-Time Setup

### 1. Create NPM Token

1. Login to [npmjs.com](https://www.npmjs.com/)
2. Go to Access Tokens: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
3. Click "Generate New Token"
4. Choose "Automation" (for CI/CD)
5. Copy the token (starts with `npm_...`)

### 2. Add NPM Token to GitHub

1. Go to repository secrets: https://github.com/cmwen/min-pmt/settings/secrets/actions
2. Click "New repository secret"
3. Name: `NPM_TOKEN`
4. Value: Paste your npm automation token
5. Click "Add secret"

### 3. Verify Permissions

Ensure you can publish to `@cmwen` scope:

```bash
npm login
npm whoami
npm access ls-packages @cmwen
```

## That's It!

Once setup is complete, you can release with just:

```bash
git tag -a v0.2.9 -m "Release 0.2.9"
git push origin v0.2.9
```

The CI/CD pipeline will automatically:
- ✅ Build and test
- ✅ Bundle CLI
- ✅ Publish to npm
- ✅ Create GitHub Release

## Test the Setup

After adding the NPM_TOKEN:

1. Create a test tag:
   ```bash
   git tag -a v0.0.0-test -m "Test release workflow"
   git push origin v0.0.0-test
   ```

2. Watch the workflow:
   ```bash
   gh run watch
   ```

3. Check it worked:
   - npm: https://www.npmjs.com/package/@cmwen/min-pmt
   - GitHub: https://github.com/cmwen/min-pmt/releases

4. Delete test release:
   ```bash
   npm unpublish @cmwen/min-pmt@0.0.0-test
   gh release delete v0.0.0-test
   git tag -d v0.0.0-test
   git push origin :refs/tags/v0.0.0-test
   ```

## Troubleshooting

### "403 Forbidden" during npm publish

- NPM_TOKEN is missing or invalid
- Solution: Regenerate token and update GitHub secret

### "You do not have permission"

- Your npm account doesn't have access to @cmwen scope
- Solution: Get added as a collaborator or use your own scope

### Workflow not triggering

- Tag must start with 'v' (e.g., v0.2.9, not 0.2.9)
- Solution: Use `git tag -a v0.2.9`

## Security Notes

- ✅ Use "Automation" tokens for CI/CD
- ✅ Never commit tokens to repository
- ✅ Tokens are stored securely in GitHub Secrets
- ✅ Only repository admins can view/edit secrets
- ✅ Rotate tokens periodically (every 6-12 months)

## Full Documentation

See [docs/automated-release.md](docs/automated-release.md) for complete guide.
