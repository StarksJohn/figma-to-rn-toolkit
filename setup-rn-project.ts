/**
 * Setup script: copies Cursor Figma design system rules to a target RN project.
 *
 * Usage:
 *   npx figma-to-rn-toolkit setup <target-project-path>
 *   ts-node setup-rn-project.ts <target-project-path>
 */

import * as fs from 'fs';
import * as path from 'path';

const RULES_SOURCE = path.join(__dirname, '.cursor', 'rules', 'figma-design-system.mdc');

function setup(targetDir: string): void {
  if (!fs.existsSync(targetDir)) {
    console.error(`Target directory does not exist: ${targetDir}`);
    process.exit(1);
  }

  const targetRulesDir = path.join(targetDir, '.cursor', 'rules');
  const targetRulesFile = path.join(targetRulesDir, 'figma-design-system.mdc');

  if (!fs.existsSync(targetRulesDir)) {
    fs.mkdirSync(targetRulesDir, { recursive: true });
    console.log(`Created: ${targetRulesDir}`);
  }

  if (fs.existsSync(targetRulesFile)) {
    const backup = targetRulesFile + '.bak';
    fs.copyFileSync(targetRulesFile, backup);
    console.log(`Backed up existing rules to: ${backup}`);
  }

  fs.copyFileSync(RULES_SOURCE, targetRulesFile);
  console.log(`Copied RN design system rules to: ${targetRulesFile}`);

  const targetIgnore = path.join(targetDir, '.cursorignore');
  const ignoreEntries = [
    'node_modules/',
    'android/app/build/',
    'android/.gradle/',
    'ios/Pods/',
    'ios/build/',
    'dist/',
    'build/',
    '.expo/',
    'coverage/',
  ];

  if (!fs.existsSync(targetIgnore)) {
    fs.writeFileSync(targetIgnore, ignoreEntries.join('\n') + '\n', 'utf8');
    console.log(`Created .cursorignore at: ${targetIgnore}`);
  } else {
    console.log(`.cursorignore already exists at: ${targetIgnore} (skipped)`);
  }

  console.log('\nSetup complete. Next steps:');
  console.log('1. Install Cursor Figma plugin: /add-plugin figma');
  console.log('2. Authenticate Figma MCP (Cursor will prompt you)');
  console.log('3. Use "implement design <figma-url>" in Cursor Chat to generate RN components');
  console.log('4. Or use CLI: npx figma-to-rn generate -u <figma-url> -o ./src/components');
}

const targetDir = process.argv[2];

if (!targetDir) {
  console.log('Usage: ts-node setup-rn-project.ts <target-project-path>');
  console.log('       npx figma-to-rn-toolkit setup <target-project-path>');
  console.log('\nThis copies Cursor Figma RN design rules and .cursorignore to the target project.');
  process.exit(0);
}

setup(path.resolve(targetDir));
