#!/usr/bin/env node

/**
 * Pre-publish checklist for figma-to-rn-toolkit
 * Run this before publishing to npm
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const chalk = {
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    cyan: (text) => `\x1b[36m${text}\x1b[0m`,
    bold: (text) => `\x1b[1m${text}\x1b[0m`
};

console.log(chalk.cyan(chalk.bold('======================================')));
console.log(chalk.cyan(chalk.bold('NPM Pre-Publish Checklist')));
console.log(chalk.cyan(chalk.bold('======================================')));
console.log();

let errors = [];
let warnings = [];
let successes = [];

// Check 1: Verify package.json exists
console.log(chalk.bold('1. Checking package.json...'));
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    errors.push('package.json not found');
} else {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Check required fields
    const requiredFields = ['name', 'version', 'description', 'main', 'author', 'license'];
    const missingFields = requiredFields.filter(field => !packageJson[field]);

    if (missingFields.length > 0) {
        errors.push(`Missing required fields in package.json: ${missingFields.join(', ')}`);
    } else {
        successes.push('package.json has all required fields');
        console.log(`  Package: ${packageJson.name}`);
        console.log(`  Version: ${packageJson.version}`);
        console.log(`  License: ${packageJson.license}`);
    }

    // Check repository info
    if (!packageJson.repository || !packageJson.repository.url) {
        warnings.push('Missing repository information in package.json');
    }

    // Check keywords
    if (!packageJson.keywords || packageJson.keywords.length === 0) {
        warnings.push('No keywords specified in package.json');
    }
}

// Check 2: NPM authentication
console.log(chalk.bold('\n2. Checking NPM authentication...'));
try {
    const npmUser = execSync('npm whoami', { encoding: 'utf8' }).trim();
    successes.push(`Authenticated as: ${npmUser}`);
    console.log(`  ${chalk.green('✓')} Logged in as: ${npmUser}`);
} catch (error) {
    errors.push('Not logged in to NPM. Run: npm login');
    console.log(`  ${chalk.red('✗')} Not authenticated`);
}

// Check 3: Check if package name is available
console.log(chalk.bold('\n3. Checking package name availability...'));
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const packageName = packageJson.name;

try {
    execSync(`npm view ${packageName}`, { encoding: 'utf8', stdio: 'ignore' });
    warnings.push(`Package name '${packageName}' already exists on NPM. You may need to use 'npm publish --force' or increment version.`);
    console.log(`  ${chalk.yellow('⚠')} Package already exists`);
} catch (error) {
    if (error.status === 1) {
        successes.push(`Package name '${packageName}' is available`);
        console.log(`  ${chalk.green('✓')} Package name is available`);
    } else {
        warnings.push('Could not check package availability');
    }
}

// Check 4: Build status
console.log(chalk.bold('\n4. Checking build...'));
if (!fs.existsSync(path.join(process.cwd(), 'dist'))) {
    errors.push('Build directory (dist) not found. Run: npm run build');
    console.log(`  ${chalk.red('✗')} Build directory missing`);
} else {
    // Check if main file exists
    const mainFile = path.join(process.cwd(), packageJson.main || 'dist/index.js');
    if (fs.existsSync(mainFile)) {
        successes.push('Build files exist');
        console.log(`  ${chalk.green('✓')} Build completed`);
    } else {
        errors.push(`Main file not found: ${packageJson.main}`);
        console.log(`  ${chalk.red('✗')} Main file missing`);
    }
}

// Check 5: Test status
console.log(chalk.bold('\n5. Running tests...'));
try {
    execSync('npm test', { encoding: 'utf8', stdio: 'ignore' });
    successes.push('All tests passed');
    console.log(`  ${chalk.green('✓')} Tests passed`);
} catch (error) {
    warnings.push('Tests failed or not configured');
    console.log(`  ${chalk.yellow('⚠')} Tests skipped or failed`);
}

// Check 6: Git status
console.log(chalk.bold('\n6. Checking Git status...'));
try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
        warnings.push('Uncommitted changes detected. Consider committing before publishing.');
        console.log(`  ${chalk.yellow('⚠')} Uncommitted changes`);
    } else {
        successes.push('No uncommitted changes');
        console.log(`  ${chalk.green('✓')} Git working directory clean`);
    }
} catch (error) {
    warnings.push('Git repository not initialized');
}

// Check 7: Files to publish
console.log(chalk.bold('\n7. Checking files to publish...'));
const filesToPublish = packageJson.files || [];
if (filesToPublish.length === 0) {
    warnings.push('No "files" field in package.json. All files will be published.');
    console.log(`  ${chalk.yellow('⚠')} No files field specified`);
} else {
    console.log(`  Files to publish: ${filesToPublish.join(', ')}`);
    successes.push(`${filesToPublish.length} file patterns configured`);
}

// Check 8: README file
console.log(chalk.bold('\n8. Checking documentation...'));
const readmeFiles = ['README.md', 'README_zh.md'];
const foundReadme = readmeFiles.filter(file => fs.existsSync(path.join(process.cwd(), file)));
if (foundReadme.length === 0) {
    errors.push('No README file found');
    console.log(`  ${chalk.red('✗')} README missing`);
} else {
    successes.push(`Found README files: ${foundReadme.join(', ')}`);
    console.log(`  ${chalk.green('✓')} Documentation present`);
}

// Check 9: License file
console.log(chalk.bold('\n9. Checking license...'));
if (!fs.existsSync(path.join(process.cwd(), 'LICENSE'))) {
    warnings.push('LICENSE file not found');
    console.log(`  ${chalk.yellow('⚠')} LICENSE file missing`);
} else {
    successes.push('LICENSE file present');
    console.log(`  ${chalk.green('✓')} LICENSE found`);
}

// Check 10: .npmignore
console.log(chalk.bold('\n10. Checking .npmignore...'));
if (!fs.existsSync(path.join(process.cwd(), '.npmignore'))) {
    warnings.push('No .npmignore file. Consider creating one to exclude unnecessary files.');
    console.log(`  ${chalk.yellow('⚠')} .npmignore not found`);
} else {
    successes.push('.npmignore configured');
    console.log(`  ${chalk.green('✓')} .npmignore present`);
}

// Summary
console.log();
console.log(chalk.cyan(chalk.bold('======================================')));
console.log(chalk.cyan(chalk.bold('Pre-Publish Check Summary')));
console.log(chalk.cyan(chalk.bold('======================================')));
console.log();

if (successes.length > 0) {
    console.log(chalk.green(chalk.bold(`✓ ${successes.length} checks passed:`)));
    successes.forEach(s => console.log(`  ${chalk.green('✓')} ${s}`));
}

if (warnings.length > 0) {
    console.log();
    console.log(chalk.yellow(chalk.bold(`⚠ ${warnings.length} warnings:`)));
    warnings.forEach(w => console.log(`  ${chalk.yellow('⚠')} ${w}`));
}

if (errors.length > 0) {
    console.log();
    console.log(chalk.red(chalk.bold(`✗ ${errors.length} errors found:`)));
    errors.forEach(e => console.log(`  ${chalk.red('✗')} ${e}`));
    console.log();
    console.log(chalk.red('Please fix the errors above before publishing.'));
    process.exit(1);
} else {
    console.log();
    console.log(chalk.green(chalk.bold('✓ Package is ready to publish!')));
    console.log();
    console.log('To publish, run:');
    console.log('  npm publish');
    console.log('or use the automated script:');
    console.log('  npm run publish:auto');
}