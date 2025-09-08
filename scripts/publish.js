#!/usr/bin/env node

/**
 * Simple publish script - just updates CLI dependency versions when needed
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const CLI_PACKAGE_PATH = path.join(__dirname, '../packages/cli/package.json');

// Current versions of our packages
const VERSIONS = {
  '@cmwen/min-pmt-core': '0.1.0',
  '@cmwen/min-pmt-web': '0.1.0',
};

function updateCliDependencies() {
  const packageJson = JSON.parse(fs.readFileSync(CLI_PACKAGE_PATH, 'utf8'));

  let updated = false;
  for (const [depName, version] of Object.entries(VERSIONS)) {
    if (packageJson.dependencies[depName] !== `^${version}`) {
      packageJson.dependencies[depName] = `^${version}`;
      console.log(`📦 Updated ${depName} to ^${version}`);
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(CLI_PACKAGE_PATH, `${JSON.stringify(packageJson, null, 2)}\n`);
    console.log('✅ CLI dependencies updated');
  } else {
    console.log('✅ CLI dependencies already up to date');
  }
}

function publishPackage(packageName) {
  const packagePath = path.join(__dirname, '../packages', packageName);
  console.log(`\n🚀 Publishing ${packageName}...`);

  try {
    execSync('npm publish', {
      cwd: packagePath,
      stdio: 'inherit',
    });
    console.log(`✅ Published ${packageName}`);
  } catch (_error) {
    console.error(`❌ Failed to publish ${packageName}`);
    process.exit(1);
  }
}

function main() {
  const [, , command, packageName] = process.argv;

  if (command === 'update-cli') {
    updateCliDependencies();
    return;
  }

  if (command === 'publish' && packageName) {
    if (packageName === 'cli') {
      updateCliDependencies();
    }
    publishPackage(packageName);
    return;
  }

  console.log(`
Usage:
  node scripts/publish.js update-cli     # Update CLI dependencies
  node scripts/publish.js publish core   # Publish core package
  node scripts/publish.js publish web    # Publish web package  
  node scripts/publish.js publish cli    # Publish CLI (auto-updates deps)
`);
}

if (require.main === module) {
  main();
}
