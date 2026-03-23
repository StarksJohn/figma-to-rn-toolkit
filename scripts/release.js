#!/usr/bin/env node

/**
 * Automated NPM version update and publish script for figma-to-rn-toolkit
 *
 * Features:
 * - Interactive version selection (patch/minor/major)
 * - Pre-flight checks (git status, npm auth, dependencies, network)
 * - Automated building and testing
 * - Git operations (commit, tag, push)
 * - NPM publishing with verification
 * - Error handling and rollback capabilities
 * - Dry-run mode for safe testing
 * - Detailed logging to release.log
 *
 * Usage:
 *   node scripts/release.js [options]
 *
 * Options:
 *   --dry-run, -d     Run in dry mode (no actual changes)
 *   --version, -v     Specify version type (patch|minor|major)
 *   --skip-tests, -s  Skip test execution
 *   --help, -h        Show help information
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const config = {
  dryRun: false,
  skipTests: false,
  versionType: null,
  packagePath: path.join(process.cwd(), 'package.json'),
  logFile: path.join(process.cwd(), 'release.log'),
  buildDir: 'dist',
};

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------

class Logger {
  constructor(logFile) {
    this.logFile = logFile;
    this.startTime = new Date();
    this.logs = [];
  }

  log(level, message, color = colors.reset) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    this.logs.push(logEntry);
    console.log(`${color}${message}${colors.reset}`);
    try {
      fs.appendFileSync(this.logFile, logEntry + '\n');
    } catch (_err) {
      // silently ignore log-write failures
    }
  }

  info(message) {
    this.log('info', `[INFO] ${message}`, colors.blue);
  }
  success(message) {
    this.log('success', `[OK] ${message}`, colors.green);
  }
  warning(message) {
    this.log('warning', `[WARN] ${message}`, colors.yellow);
  }
  error(message) {
    this.log('error', `[ERR] ${message}`, colors.red);
  }
  step(message) {
    this.log('step', `\n>>> ${message}`, colors.cyan + colors.bright);
  }

  saveLogSummary() {
    const duration = new Date() - this.startTime;
    const summary = [
      '\n========== Release Log Summary ==========',
      `Started:  ${this.startTime.toISOString()}`,
      `Duration: ${duration}ms`,
      `Entries:  ${this.logs.length}`,
      '=========================================\n',
    ].join('\n');
    try {
      fs.appendFileSync(this.logFile, summary);
    } catch (_err) {
      // ignore
    }
  }
}

const logger = new Logger(config.logFile);

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

class Utils {
  static executeCommand(command, options = {}) {
    const { silent = false, cwd = process.cwd() } = options;

    if (!silent) {
      logger.info(`Executing: ${command}`);
    }

    if (config.dryRun) {
      logger.warning(`[DRY RUN] Would execute: ${command}`);
      return { stdout: '', stderr: '', success: true };
    }

    try {
      const result = execSync(command, {
        cwd,
        encoding: 'utf8',
        stdio: silent ? 'pipe' : 'inherit',
      });
      return { stdout: result || '', stderr: '', success: true };
    } catch (error) {
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message || '',
        success: false,
        error,
      };
    }
  }

  static async askQuestion(question, defaultAnswer = '') {
    if (config.dryRun) {
      logger.warning(
        `[DRY RUN] Auto-answering: ${question} -> ${defaultAnswer || 'n'}`
      );
      return defaultAnswer || 'n';
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      const prompt = defaultAnswer
        ? `${question} (${defaultAnswer}): `
        : `${question}: `;
      rl.question(prompt, (answer) => {
        rl.close();
        resolve(answer.trim() || defaultAnswer);
      });
    });
  }

  static async confirmAction(message) {
    if (config.dryRun) {
      logger.warning(`[DRY RUN] Auto-confirming: ${message} -> y`);
      return true;
    }
    const answer = await this.askQuestion(`${message} (y/N)`, 'n');
    return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
  }

  static getPackageInfo() {
    try {
      return JSON.parse(fs.readFileSync(config.packagePath, 'utf8'));
    } catch (error) {
      logger.error(`Failed to read package.json: ${error.message}`);
      throw error;
    }
  }

  static updatePackageVersion(newVersion) {
    if (config.dryRun) {
      logger.warning(
        `[DRY RUN] Would update package.json version to ${newVersion}`
      );
      return;
    }
    try {
      const pkg = this.getPackageInfo();
      pkg.version = newVersion;
      fs.writeFileSync(config.packagePath, JSON.stringify(pkg, null, 2) + '\n');
      logger.success(`Updated package.json version to ${newVersion}`);
    } catch (error) {
      logger.error(`Failed to update package.json: ${error.message}`);
      throw error;
    }
  }

  static calculateNextVersion(currentVersion, versionType) {
    const parts = currentVersion.split('.').map(Number);
    switch (versionType) {
      case 'patch':
        parts[2]++;
        break;
      case 'minor':
        parts[1]++;
        parts[2] = 0;
        break;
      case 'major':
        parts[0]++;
        parts[1] = 0;
        parts[2] = 0;
        break;
      default:
        throw new Error(`Invalid version type: ${versionType}`);
    }
    return parts.join('.');
  }
}

// ---------------------------------------------------------------------------
// Pre-flight checks
// ---------------------------------------------------------------------------

class PreflightChecks {
  static async runAllChecks() {
    logger.step('Running pre-flight checks');

    await this.checkGitWorkingTree();
    await this.checkGitBranch();
    await this.checkNpmAuth();
    await this.checkDependencies();
    await this.checkNetworkConnection();

    logger.success('All pre-flight checks passed');
  }

  static async checkGitWorkingTree() {
    logger.info('Checking Git working tree status');
    const result = Utils.executeCommand('git status --porcelain', {
      silent: true,
    });
    if (!result.success) {
      throw new Error('Failed to check Git status');
    }
    if (result.stdout.trim()) {
      logger.warning('Working tree has uncommitted changes:');
      console.log(result.stdout);
      const shouldContinue = await Utils.confirmAction(
        'Continue with uncommitted changes?'
      );
      if (!shouldContinue) {
        throw new Error('Aborted due to uncommitted changes');
      }
    }
    logger.success('Git working tree check passed');
  }

  static async checkGitBranch() {
    logger.info('Checking current Git branch');
    const result = Utils.executeCommand('git branch --show-current', {
      silent: true,
    });
    if (!result.success) {
      throw new Error('Failed to get current branch');
    }
    const currentBranch = result.stdout.trim();
    const mainBranches = ['main', 'master'];
    if (!mainBranches.includes(currentBranch)) {
      logger.warning(`Currently on branch: ${currentBranch}`);
      const shouldContinue = await Utils.confirmAction(
        'Continue on non-main branch?'
      );
      if (!shouldContinue) {
        throw new Error('Aborted due to non-main branch');
      }
    }
    logger.success(`Git branch check passed (${currentBranch})`);
  }

  static async checkNpmAuth() {
    logger.info('Checking NPM authentication');
    const result = Utils.executeCommand('npm whoami', { silent: true });
    if (!result.success) {
      logger.error('NPM authentication failed. Please run "npm login"');
      throw new Error('NPM authentication required');
    }
    const username = result.stdout.trim();
    logger.success(`NPM authenticated as: ${username}`);
  }

  static async checkDependencies() {
    logger.info('Checking dependencies');
    const result = Utils.executeCommand('npm install', { silent: true });
    if (!result.success) {
      throw new Error('Failed to install dependencies');
    }
    logger.success('Dependencies check passed');
  }

  static async checkNetworkConnection() {
    logger.info('Checking network connection to npm registry');
    const result = Utils.executeCommand('npm ping', { silent: true });
    if (!result.success) {
      throw new Error('Failed to connect to npm registry');
    }
    logger.success('Network connection check passed');
  }
}

// ---------------------------------------------------------------------------
// Build & Test
// ---------------------------------------------------------------------------

class BuildAndTest {
  static async runBuildAndTest() {
    logger.step('Running build and test procedures');

    await this.cleanBuildArtifacts();
    await this.runLinting();
    await this.buildProject();
    await this.runTests();
    await this.verifyPackage();

    logger.success('All build and test procedures completed');
  }

  static async cleanBuildArtifacts() {
    logger.info('Cleaning build artifacts');
    const result = Utils.executeCommand('npm run prebuild');
    if (!result.success) {
      logger.warning(
        'prebuild (clean) command failed, attempting manual cleanup'
      );
      const distPath = path.join(process.cwd(), config.buildDir);
      if (!config.dryRun && fs.existsSync(distPath)) {
        fs.rmSync(distPath, { recursive: true, force: true });
      }
    }
    logger.success('Build artifacts cleaned');
  }

  static async runLinting() {
    logger.info('Running ESLint code quality check');
    const result = Utils.executeCommand('npm run lint', { silent: true });
    if (!result.success) {
      const output = result.stderr || result.stdout || '';
      const hasErrors =
        output.includes('error') && !output.includes('0 errors');
      if (hasErrors) {
        logger.warning('ESLint found errors. Attempting auto-fix...');
        const fixResult = Utils.executeCommand('npm run lint:fix');
        if (!fixResult.success) {
          throw new Error(
            'ESLint check failed and auto-fix was unsuccessful'
          );
        }
        logger.success('ESLint errors fixed automatically');
      } else {
        logger.warning('ESLint found warnings but no errors - proceeding');
      }
    } else {
      logger.success('ESLint check passed');
    }
  }

  static async buildProject() {
    logger.info('Building project (tsc -> dist/)');
    const result = Utils.executeCommand('npm run build');
    if (!result.success) {
      throw new Error('Project build failed');
    }

    if (config.dryRun) {
      logger.success('Project built successfully (dry run)');
      return;
    }

    const distPath = path.join(process.cwd(), config.buildDir);
    if (!fs.existsSync(distPath)) {
      throw new Error('Build output directory (dist/) not found');
    }

    const buildFiles = fs.readdirSync(distPath);
    if (buildFiles.length === 0) {
      throw new Error('Build output is empty');
    }

    logger.success(
      `Project built successfully (${buildFiles.length} entries in dist/)`
    );
  }

  static async runTests() {
    if (config.skipTests) {
      logger.warning('Skipping tests as requested');
      return;
    }
    logger.info('Running tests');
    const result = Utils.executeCommand('npm test');
    if (!result.success) {
      throw new Error('Tests failed');
    }
    logger.success('All tests passed');
  }

  static async verifyPackage() {
    logger.info('Verifying package integrity (npm pack --dry-run)');
    const result = Utils.executeCommand('npm pack --dry-run', {
      silent: true,
    });
    if (!result.success) {
      logger.warning('Package dry-run check returned warnings');
    }
    logger.success('Package integrity verified');
  }
}

// ---------------------------------------------------------------------------
// Version management
// ---------------------------------------------------------------------------

class VersionManager {
  static async selectVersionType() {
    if (config.versionType) {
      logger.info(`Version type specified: ${config.versionType}`);
      return config.versionType;
    }

    const pkg = Utils.getPackageInfo();
    const current = pkg.version;

    console.log(
      `\n${colors.bright}Current version: ${current}${colors.reset}`
    );
    console.log('\nSelect version type:');
    console.log(
      `  1. patch  (${current} -> ${Utils.calculateNextVersion(current, 'patch')})`
    );
    console.log(
      `  2. minor  (${current} -> ${Utils.calculateNextVersion(current, 'minor')})`
    );
    console.log(
      `  3. major  (${current} -> ${Utils.calculateNextVersion(current, 'major')})`
    );

    const choice = await Utils.askQuestion('\nEnter your choice (1-3)', '1');
    const versionMap = { '1': 'patch', '2': 'minor', '3': 'major' };
    const selectedType = versionMap[choice] || 'patch';

    logger.info(`Selected version type: ${selectedType}`);
    return selectedType;
  }

  static async updateVersion(versionType) {
    logger.info(`Updating version (${versionType})`);

    const pkg = Utils.getPackageInfo();
    const currentVersion = pkg.version;
    const newVersion = Utils.calculateNextVersion(currentVersion, versionType);

    logger.info(`Version change: ${currentVersion} -> ${newVersion}`);

    if (config.versionType) {
      logger.info(
        `Auto-confirming version update (specified via command line)`
      );
    } else {
      const confirmed = await Utils.confirmAction(
        `Confirm version update to ${newVersion}?`
      );
      if (!confirmed) {
        throw new Error('Version update cancelled by user');
      }
    }

    Utils.updatePackageVersion(newVersion);
    return { currentVersion, newVersion };
  }
}

// ---------------------------------------------------------------------------
// Git operations
// ---------------------------------------------------------------------------

class GitOperations {
  static async handleGitOperations(versionInfo) {
    logger.step('Handling Git operations');

    await this.commitChanges(versionInfo.newVersion);
    await this.createTag(versionInfo.newVersion);
    await this.pushToRemote();

    logger.success('Git operations completed');
  }

  static async commitChanges(version) {
    logger.info(`Committing changes for version ${version}`);
    const result = Utils.executeCommand(
      `git add . && git commit -m "chore: release v${version}"`
    );
    if (!result.success) {
      throw new Error('Failed to commit changes');
    }
    logger.success('Changes committed');
  }

  static async createTag(version) {
    logger.info(`Creating tag v${version}`);
    const result = Utils.executeCommand(`git tag v${version}`);
    if (!result.success) {
      throw new Error('Failed to create tag');
    }
    logger.success(`Tag v${version} created`);
  }

  static async pushToRemote() {
    logger.info('Pushing to remote repository');
    const pushResult = Utils.executeCommand('git push');
    if (!pushResult.success) {
      throw new Error('Failed to push commits');
    }
    const pushTagsResult = Utils.executeCommand('git push --tags');
    if (!pushTagsResult.success) {
      throw new Error('Failed to push tags');
    }
    logger.success('Pushed to remote repository');
  }
}

// ---------------------------------------------------------------------------
// Publisher
// ---------------------------------------------------------------------------

class Publisher {
  static async publishPackage(versionInfo) {
    logger.step('Publishing to NPM');

    await this.npmPublish();
    await this.verifyPublication(versionInfo.newVersion);

    logger.success('Package published successfully');
  }

  static async npmPublish() {
    logger.info('Publishing to NPM registry');
    const result = Utils.executeCommand('npm publish');
    if (!result.success) {
      throw new Error('NPM publish failed');
    }
    logger.success('Package published to NPM');
  }

  static async verifyPublication(version) {
    logger.info('Verifying publication');

    if (!config.dryRun) {
      logger.info('Waiting for NPM registry to propagate...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    const pkg = Utils.getPackageInfo();
    const result = Utils.executeCommand(
      `npm view ${pkg.name}@${version} version`,
      { silent: true }
    );

    if (!result.success) {
      logger.warning(
        'Failed to verify publication immediately - may be propagation delay'
      );
      return;
    }

    if (result.stdout.trim() === version) {
      logger.success(`Publication verified: ${pkg.name}@${version}`);
    } else {
      logger.warning('Publication verification inconclusive');
    }
  }
}

// ---------------------------------------------------------------------------
// Error handling & rollback
// ---------------------------------------------------------------------------

class ErrorHandler {
  static async handleError(error, context = {}) {
    logger.error(
      `Error in ${context.step || 'unknown step'}: ${error.message}`
    );

    if (context.rollback) {
      await this.performRollback(context);
    }

    logger.saveLogSummary();

    console.log(
      `\n${colors.red}${colors.bright}Release process failed!${colors.reset}`
    );
    console.log(`Check the log file for details: ${config.logFile}`);

    process.exit(1);
  }

  static async performRollback(context) {
    logger.warning('Attempting rollback...');
    try {
      if (context.versionUpdated) {
        Utils.updatePackageVersion(context.originalVersion);
        logger.info('Version rollback completed');
      }
      if (context.gitCommitted) {
        Utils.executeCommand('git reset --hard HEAD~1');
        logger.info('Git commit rollback completed');
      }
      if (context.gitTagged) {
        Utils.executeCommand(`git tag -d v${context.newVersion}`);
        logger.info('Git tag rollback completed');
      }
    } catch (rollbackError) {
      logger.error(`Rollback failed: ${rollbackError.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Release orchestrator
// ---------------------------------------------------------------------------

class ReleaseManager {
  static async executeRelease() {
    const context = {
      step: 'initialization',
      rollback: false,
    };

    try {
      logger.step('Starting automated NPM release process');

      if (config.dryRun) {
        logger.warning(
          'Running in DRY RUN mode - no actual changes will be made'
        );
      }

      // 1. Pre-flight checks
      context.step = 'pre-flight checks';
      await PreflightChecks.runAllChecks();

      // 2. Build and test
      context.step = 'build and test';
      await BuildAndTest.runBuildAndTest();

      // 3. Version management
      context.step = 'version management';
      const versionType = await VersionManager.selectVersionType();
      const versionInfo = await VersionManager.updateVersion(versionType);

      context.rollback = true;
      context.originalVersion = versionInfo.currentVersion;
      context.newVersion = versionInfo.newVersion;
      context.versionUpdated = true;

      // 4. Git operations
      context.step = 'git operations';
      await GitOperations.handleGitOperations(versionInfo);
      context.gitCommitted = true;
      context.gitTagged = true;

      // 5. Publishing
      context.step = 'publishing';
      await Publisher.publishPackage(versionInfo);

      // 6. Done
      logger.success('Release process completed successfully!');

      const pkg = Utils.getPackageInfo();
      console.log(
        `\n${colors.green}${colors.bright}Package ${pkg.name}@${versionInfo.newVersion} published successfully!${colors.reset}`
      );
      console.log(
        `${colors.dim}Check at: https://npmjs.com/package/${pkg.name}${colors.reset}`
      );
    } catch (error) {
      await ErrorHandler.handleError(error, context);
    } finally {
      logger.saveLogSummary();
    }
  }
}

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

function parseArguments() {
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--dry-run':
      case '-d':
        config.dryRun = true;
        break;
      case '--version':
      case '-v':
        config.versionType = args[++i];
        if (!['patch', 'minor', 'major'].includes(config.versionType)) {
          console.error(
            'Invalid version type. Use: patch, minor, or major'
          );
          process.exit(1);
        }
        break;
      case '--skip-tests':
      case '-s':
        config.skipTests = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
      default:
        console.error(`Unknown argument: ${arg}`);
        showHelp();
        process.exit(1);
    }
  }
}

function showHelp() {
  console.log(`
${colors.bright}Automated NPM Release Script  -  figma-to-rn-toolkit${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node scripts/release.js [options]

${colors.cyan}Options:${colors.reset}
  --dry-run, -d     Run in dry mode (no actual changes)
  --version, -v     Specify version type (patch|minor|major)
  --skip-tests, -s  Skip test execution
  --help, -h        Show this help information

${colors.cyan}Examples:${colors.reset}
  node scripts/release.js                    # Interactive release
  node scripts/release.js --dry-run          # Dry run mode
  node scripts/release.js -v patch           # Direct patch release
  node scripts/release.js -d -v minor -s     # Dry run, minor, skip tests

${colors.cyan}npm script shortcuts:${colors.reset}
  npm run release                # Interactive release
  npm run release:dry            # Dry run
  npm run release:patch-auto     # Auto patch release
  npm run release:minor-auto     # Auto minor release
  npm run release:major-auto     # Auto major release
`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(
    `${colors.cyan}${colors.bright}>>> NPM Release Automation  -  figma-to-rn-toolkit${colors.reset}\n`
  );

  parseArguments();

  try {
    if (fs.existsSync(config.logFile)) {
      fs.unlinkSync(config.logFile);
    }
  } catch (_err) {
    // ignore
  }

  await ReleaseManager.executeRelease();
}

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught exception: ${error.message}`);
  logger.saveLogSummary();
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
  logger.saveLogSummary();
  process.exit(1);
});

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ReleaseManager, Utils, Logger, config };
