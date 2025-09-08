#!/usr/bin/env node

/**
 * Version management script for publishing
 * Updates version numbers in the prepare script and bumps package versions
 */

const fs = require('node:fs');
const path = require('node:path');

const PREPARE_SCRIPT_PATH = path.join(__dirname, 'prepare-publish.js');

function updateVersionInPrepareScript(packageName, newVersion) {
  let content = fs.readFileSync(PREPARE_SCRIPT_PATH, 'utf8');

  const regex = new RegExp(`'${packageName}': '[^']*'`);
  const replacement = `'${packageName}': '${newVersion}'`;

  content = content.replace(regex, replacement);

  fs.writeFileSync(PREPARE_SCRIPT_PATH, content);
  console.log(`✓ Updated ${packageName} version to ${newVersion} in prepare script`);
}

function bumpPackageVersion(packagePath, newVersion) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  packageJson.version = newVersion;

  fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  console.log(`✓ Bumped ${path.basename(packagePath)} package.json to ${newVersion}`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    console.log('Usage: node version-bump.js <package-name> <new-version>');
    console.log('Examples:');
    console.log('  node version-bump.js cli 0.2.6');
    console.log('  node version-bump.js core 0.1.1');
    console.log('  node version-bump.js web 0.1.1');
    process.exit(1);
  }

  const [packageShortName, newVersion] = args;

  // Map short names to full names
  const packageMap = {
    cli: '@cmwen/min-pmt',
    core: '@cmwen/min-pmt-core',
    web: '@cmwen/min-pmt-web',
  };

  const fullPackageName = packageMap[packageShortName];
  if (!fullPackageName) {
    console.error(`❌ Unknown package: ${packageShortName}`);
    console.log('Available packages: cli, core, web');
    process.exit(1);
  }

  const packagePath = path.join(__dirname, '..', 'packages', packageShortName);
  if (!fs.existsSync(packagePath)) {
    console.error(`❌ Package directory not found: ${packagePath}`);
    process.exit(1);
  }

  console.log(`🔄 Bumping ${packageShortName} (${fullPackageName}) to ${newVersion}...`);

  // Update package.json
  bumpPackageVersion(packagePath, newVersion);

  // Update prepare script
  updateVersionInPrepareScript(fullPackageName, newVersion);

  console.log(`\n✅ Version bump complete!`);
  console.log(`💡 Now you can run: pnpm run publish:${packageShortName}`);
}

if (require.main === module) {
  main();
}

module.exports = { main, updateVersionInPrepareScript, bumpPackageVersion };
