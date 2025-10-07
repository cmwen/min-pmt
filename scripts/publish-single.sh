#!/bin/bash

# Single-module publishing script for min-pmt
# Publishes only the CLI package with bundled core, web, and MCP functionality
# Author: min-pmt team
# Usage: ./scripts/publish-single.sh [--dry-run]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}       min-pmt Single-Module Publishing Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if $DRY_RUN; then
  echo -e "${YELLOW}🔍 DRY RUN MODE - No actual publishing will occur${NC}"
  echo ""
fi

# Step 1: Check prerequisites
echo -e "${BLUE}📋 Step 1: Checking prerequisites...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "packages/cli" ]; then
  echo -e "${RED}❌ Error: Must be run from repository root${NC}"
  exit 1
fi

# Check for clean working directory
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${YELLOW}⚠️  Warning: Working directory is not clean${NC}"
  git status --short
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Check for npm credentials
if ! npm whoami &> /dev/null; then
  echo -e "${RED}❌ Error: Not logged in to npm${NC}"
  echo "Run: npm login"
  exit 1
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

# Step 2: Run tests
echo -e "${BLUE}📋 Step 2: Running tests...${NC}"
pnpm test
echo -e "${GREEN}✓ All tests passed${NC}"
echo ""

# Step 3: Run linter
echo -e "${BLUE}📋 Step 3: Running linter...${NC}"
pnpm lint:ci || true  # Continue even if linting has warnings
echo -e "${GREEN}✓ Linter check complete${NC}"
echo ""

# Step 4: Build all packages
echo -e "${BLUE}📋 Step 4: Building all packages...${NC}"
pnpm build
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Step 5: Bundle CLI
echo -e "${BLUE}📋 Step 5: Bundling CLI package...${NC}"
cd packages/cli
pnpm run build:bundle
echo -e "${GREEN}✓ CLI bundled successfully${NC}"
echo ""

# Step 6: Verify bundled CLI works
echo -e "${BLUE}📋 Step 6: Verifying bundled CLI...${NC}"
if ! node dist/bundled.js --version &> /dev/null; then
  echo -e "${RED}❌ Error: Bundled CLI doesn't work${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Bundled CLI verified${NC}"
echo ""

# Step 7: Show package info
echo -e "${BLUE}📋 Step 7: Package information${NC}"
PACKAGE_NAME=$(node -p "require('./package.json').name")
PACKAGE_VERSION=$(node -p "require('./package.json').version")
echo -e "Package: ${GREEN}${PACKAGE_NAME}${NC}"
echo -e "Version: ${GREEN}${PACKAGE_VERSION}${NC}"
echo -e "Scope: ${GREEN}@cmwen${NC}"
echo ""

# Step 8: Publish
if $DRY_RUN; then
  echo -e "${BLUE}📋 Step 8: Dry run - simulating publish...${NC}"
  npm publish --dry-run
  echo -e "${GREEN}✓ Dry run successful${NC}"
  echo ""
  echo -e "${YELLOW}This was a dry run. No package was published.${NC}"
  echo -e "${YELLOW}To publish for real, run: ./scripts/publish-single.sh${NC}"
else
  echo -e "${BLUE}📋 Step 8: Publishing to npm...${NC}"
  echo -e "${YELLOW}⚠️  About to publish ${PACKAGE_NAME}@${PACKAGE_VERSION}${NC}"
  read -p "Continue? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Publishing cancelled${NC}"
    exit 0
  fi
  
  npm publish
  echo -e "${GREEN}✓ Published successfully!${NC}"
  echo ""
  
  # Step 9: Create git tag
  echo -e "${BLUE}📋 Step 9: Creating git tag...${NC}"
  TAG="v${PACKAGE_VERSION}"
  if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Tag ${TAG} already exists, skipping${NC}"
  else
    git tag -a "$TAG" -m "Release ${PACKAGE_VERSION}"
    echo -e "${GREEN}✓ Tag ${TAG} created${NC}"
    echo -e "${YELLOW}Don't forget to push the tag: git push origin ${TAG}${NC}"
  fi
  echo ""
  
  # Success summary
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}  ✨ Successfully published ${PACKAGE_NAME}@${PACKAGE_VERSION}${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${BLUE}📦 Next steps:${NC}"
  echo -e "  1. Push the tag: ${YELLOW}git push origin ${TAG}${NC}"
  echo -e "  2. Test installation: ${YELLOW}npx ${PACKAGE_NAME}@${PACKAGE_VERSION} init${NC}"
  echo -e "  3. Create GitHub release: ${YELLOW}https://github.com/cmwen/min-pmt/releases/new?tag=${TAG}${NC}"
  echo ""
fi

cd ../..
echo -e "${GREEN}✅ Done!${NC}"
