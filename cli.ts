#!/usr/bin/env node

/**
 * Command Line Interface for Figma to React Native conversion
 */

import { Command } from 'commander';
import { FigmaToReactNative } from './index';
import { FigmaUtils } from './src/utils/figmaUtils';
import { FigmaAPIError, GenerationError } from './src/types';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

// Package information
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

program
  .name('figma-to-rn')
  .description('Convert Figma designs to React Native components')
  .version(packageJson.version);

// Main generate command
program
  .command('generate')
  .description('Generate React Native component from Figma URL')
  .requiredOption('-t, --token <token>', 'Figma personal access token')
  .requiredOption('-u, --url <url>', 'Figma component URL')
  .option('-o, --output <path>', 'Output directory path', './components')
  .option('-n, --name <name>', 'Custom component name')
  .option('--no-typescript', 'Generate JavaScript instead of TypeScript')
  .option('--no-stylesheet', 'Use inline styles instead of StyleSheet')
  .option('--tests', 'Generate test files')
  .option('--no-format', 'Skip code formatting')
  .option('--no-compile-check', 'Skip TypeScript compilation check')
  .action(async (options) => {
    try {
      console.log('🎨 Figma to React Native Converter');
      console.log('==================================');
      
      // 🚨 DEBUG: 检查接收到的参数
      console.log('🔍 Received parameters:');
      console.log(`   token: ${options.token ? '✅ provided' : '❌ missing'}`);
      console.log(`   url: ${options.url ? '✅ provided' : '❌ missing'}`);
      console.log(`   output: "${options.output}" ${options.output ? '✅ provided' : '❌ missing'}`);
      console.log(`   name: "${options.name}" ${options.name ? '✅ provided' : '❌ missing'}`);
      
      // Validate inputs
      await validateInputs(options);
      
      // Create converter
      const converter = new FigmaToReactNative(options.token, {
        outputPath: options.output,
        includeTypes: options.typescript,
        useStyleSheet: options.stylesheet,
        generateTests: options.tests,
        formatCode: options.format
      });

      console.log(`📡 Fetching component from Figma...`);
      
      // 🚨 SMART FIX: 智能处理组件名称
      let finalComponentName = options.name;
      
      if (!finalComponentName || finalComponentName === 'undefined') {
        // 如果name参数丢失，尝试从命令行参数中直接提取
        const nameArgIndex = process.argv.findIndex(arg => arg.startsWith('--name='));
        if (nameArgIndex !== -1) {
          finalComponentName = process.argv[nameArgIndex].split('=')[1];
          console.log(`📝 Recovered component name from arguments: ${finalComponentName}`);
        } else {
          finalComponentName = "CustomView";
          console.log(`📝 Using default component name: ${finalComponentName}`);
        }
      }
      
      if (finalComponentName !== options.name) {
        console.log(`📝 Using component name: ${finalComponentName} ${options.name ? '(parsed from arguments)' : '(default)'}`);
      }
      
      // Generate component
      const componentSpec = await converter.generateComponentFromUrl(options.url, {
        componentName: finalComponentName,
        outputPath: options.output,
        writeToFile: true
      });

      console.log(`✅ Successfully generated component: ${componentSpec.name}`);
      console.log(`📁 Output path: ${path.resolve(options.output)}`);
      
      // Compile check for generated files
      if (options.compileCheck !== false) {
        console.log('\n🔍 Running TypeScript compilation check...');
        await runCompileCheck(options.output, componentSpec.name);
      }
      
      // Show statistics
      const stats = converter.getStats();
      console.log('\n📊 Generation Statistics:');
      console.log(`   - Styles generated: ${stats.stylesGenerated}`);
      console.log(`   - Components: ${stats.componentsGenerated}`);

    } catch (error) {
      handleError(error);
    }
  });

// Batch generate command
program
  .command('batch')
  .description('Generate multiple components from a file containing Figma URLs')
  .requiredOption('-t, --token <token>', 'Figma personal access token')
  .requiredOption('-f, --file <file>', 'File containing Figma URLs (one per line)')
  .option('-o, --output <path>', 'Output directory path', './components')
  .option('--no-typescript', 'Generate JavaScript instead of TypeScript')
  .option('--no-stylesheet', 'Use inline styles instead of StyleSheet')
  .option('--tests', 'Generate test files')
  .option('--no-format', 'Skip code formatting')
  .option('--no-compile-check', 'Skip TypeScript compilation check')
  .option('-c, --concurrency <number>', 'Number of concurrent generations', '3')
  .action(async (options) => {
    try {
      console.log('🎨 Figma to React Native Batch Converter');
      console.log('========================================');
      
      // Validate inputs
      await validateInputs(options);
      
      // Read URLs from file
      const urls = await readUrlsFromFile(options.file);
      console.log(`📋 Found ${urls.length} URLs to process`);

      // Create converter
      const converter = new FigmaToReactNative(options.token, {
        outputPath: options.output,
        includeTypes: options.typescript,
        useStyleSheet: options.stylesheet,
        generateTests: options.tests,
        formatCode: options.format
      });

      console.log(`📡 Starting batch generation...`);
      
      // Generate components
      const results = await converter.generateMultipleComponents(urls, {
        outputPath: options.output,
        writeToFile: true,
        concurrency: parseInt(options.concurrency)
      });

      console.log(`✅ Successfully generated ${results.length} components out of ${urls.length} URLs`);
      console.log(`📁 Output path: ${path.resolve(options.output)}`);

      // Compile check for generated files
      if (options.compileCheck !== false && results.length > 0) {
        console.log('\n🔍 Running TypeScript compilation check for all generated files...');
        for (const componentSpec of results) {
          await runCompileCheck(options.output, componentSpec.name);
        }
      }

      if (results.length < urls.length) {
        console.log(`⚠️  ${urls.length - results.length} components failed to generate`);
      }

    } catch (error) {
      handleError(error);
    }
  });

// Preview command
program
  .command('preview')
  .description('Preview component information without generating code')
  .requiredOption('-t, --token <token>', 'Figma personal access token')
  .requiredOption('-u, --url <url>', 'Figma component URL')
  .action(async (options) => {
    try {
      console.log('🔍 Figma Component Preview');
      console.log('===========================');
      
      // Validate inputs
      await validateInputs(options);
      
      // Create converter
      const converter = new FigmaToReactNative(options.token);

      console.log(`📡 Fetching component information...`);
      
      // Get preview
      const preview = await converter.getComponentPreview(options.url);

      // Display information
      console.log(`\n📋 Component Information:`);
      console.log(`   Name: ${preview.name}`);
      console.log(`   Type: ${preview.analysis.componentType}`);
      console.log(`   Children: ${preview.analysis.childCount}`);
      console.log(`   Layout: ${preview.analysis.layoutType}`);
      console.log(`   Has Text: ${preview.analysis.hasText ? '✅' : '❌'}`);
      console.log(`   Has Images: ${preview.analysis.hasImages ? '✅' : '❌'}`);
      console.log(`   Has Interactive Elements: ${preview.analysis.hasInteractiveElements ? '✅' : '❌'}`);

      if (preview.colors.length > 0) {
        console.log(`\n🎨 Colors Used (${preview.colors.length}):`);
        preview.colors.forEach(color => console.log(`   - ${color}`));
      }

      if (preview.fonts.length > 0) {
        console.log(`\n📝 Fonts Used (${preview.fonts.length}):`);
        preview.fonts.forEach(font => 
          console.log(`   - ${font.fontFamily} ${font.fontSize}px (${font.fontWeight})`)
        );
      }

      if (preview.validation.warnings.length > 0) {
        console.log(`\n⚠️  Warnings:`);
        preview.validation.warnings.forEach(warning => console.log(`   - ${warning}`));
      }

      if (preview.analysis.suggestedProps.length > 0) {
        console.log(`\n💡 Suggested Props:`);
        preview.analysis.suggestedProps.forEach(prop => console.log(`   - ${prop}`));
      }

    } catch (error) {
      handleError(error);
    }
  });

// Validate command
program
  .command('validate')
  .description('Validate Figma token and URL')
  .requiredOption('-t, --token <token>', 'Figma personal access token')
  .option('-u, --url <url>', 'Figma URL to validate')
  .action(async (options) => {
    try {
      console.log('🔐 Figma Token & URL Validation');
      console.log('===============================');
      
      // Validate token format
      if (!FigmaUtils.isValidToken(options.token)) {
        console.log('❌ Invalid token format');
        process.exit(1);
      }
      console.log('✅ Token format is valid');

      // Test token
      const converter = new FigmaToReactNative(options.token);
      const isValidToken = await converter.validateToken();
      
      if (isValidToken) {
        console.log('✅ Token is valid and authenticated');
      } else {
        console.log('❌ Token authentication failed');
        process.exit(1);
      }

      // Validate URL if provided
      if (options.url) {
        if (FigmaUtils.isValidFigmaUrl(options.url)) {
          console.log('✅ URL format is valid');
          
          const urlInfo = FigmaUtils.parseUrl(options.url);
          console.log(`   File Key: ${urlInfo.fileKey}`);
          if (urlInfo.nodeId) {
            console.log(`   Node ID: ${urlInfo.nodeId}`);
          }
        } else {
          console.log('❌ Invalid URL format');
          process.exit(1);
        }
      }

    } catch (error) {
      handleError(error);
    }
  });

// Utility functions
async function validateInputs(options: any): Promise<void> {
  // Validate token
  if (!FigmaUtils.isValidToken(options.token)) {
    throw new Error('Invalid Figma token format. Expected format: figd_...');
  }

  // Validate URL if present
  if (options.url && !FigmaUtils.isValidFigmaUrl(options.url)) {
    throw new Error('Invalid Figma URL format');
  }

  // Validate output path
  if (options.output) {
    const outputDir = path.dirname(path.resolve(options.output));
    try {
      await fs.promises.access(outputDir);
    } catch {
      // Try to create directory
      await fs.promises.mkdir(outputDir, { recursive: true });
    }
  }

  // Validate file for batch command
  if (options.file) {
    try {
      await fs.promises.access(options.file);
    } catch {
      throw new Error(`File not found: ${options.file}`);
    }
  }
}

async function readUrlsFromFile(filePath: string): Promise<string[]> {
  const content = await fs.promises.readFile(filePath, 'utf8');
  const urls = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'))
    .filter(line => FigmaUtils.isValidFigmaUrl(line));

  if (urls.length === 0) {
    throw new Error('No valid Figma URLs found in the file');
  }

  return urls;
}

async function runCompileCheck(outputPath: string, componentName: string): Promise<void> {
  try {
    const { spawn } = require('child_process');
    const componentFile = path.join(outputPath, `${componentName}.tsx`);
    const absolutePath = path.resolve(componentFile);
    
    console.log(`   Checking: ${componentFile}`);
    
    // Check if TypeScript compiler is available with React Native specific options
    const tscProcess = spawn('npx', [
      'tsc', 
      '--noEmit', 
      '--skipLibCheck',
      '--jsx', 'react-native',
      '--esModuleInterop',
      '--allowSyntheticDefaultImports',
      '--target', 'es2017',
      '--lib', 'es2017',
      '--moduleResolution', 'node',
      absolutePath
    ], {
      stdio: 'pipe',
      shell: true
    });
    
    let stdout = '';
    let stderr = '';
    
    tscProcess.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });
    
    tscProcess.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });
    
    await new Promise<void>((resolve, reject) => {
      tscProcess.on('close', (code: number) => {
        if (code === 0) {
          console.log('   ✅ TypeScript compilation check passed');
          resolve();
        } else {
          console.log('   ❌ TypeScript compilation errors found:');
          if (stderr) {
            // Filter and format TypeScript errors
            const errors = stderr.split('\n')
              .filter(line => line.trim() && !line.includes('error TS6053'))
              .map(line => `      ${line}`)
              .join('\n');
            console.log(errors);
          }
          if (stdout) {
            const errors = stdout.split('\n')
              .filter(line => line.trim())
              .map(line => `      ${line}`)
              .join('\n');
            console.log(errors);
          }
          console.log('   💡 Please fix the above TypeScript errors');
          resolve(); // Don't fail the entire process, just warn
        }
      });
      
      tscProcess.on('error', (err: Error) => {
        console.log('   ⚠️  TypeScript compiler not available, skipping check');
        console.log('   💡 Install TypeScript: npm install -g typescript');
        resolve();
      });
    });
    
  } catch (error) {
    console.log('   ⚠️  Compilation check failed:', error instanceof Error ? error.message : error);
    console.log('   💡 Make sure TypeScript is installed: npm install -g typescript');
  }
}

function handleError(error: any): void {
  console.error('\n❌ Error:');
  
  if (error instanceof FigmaAPIError) {
    console.error(`   Figma API Error: ${error.message}`);
    if (error.statusCode) {
      console.error(`   Status Code: ${error.statusCode}`);
    }
  } else if (error instanceof GenerationError) {
    console.error(`   Generation Error: ${error.message}`);
    if (error.componentName) {
      console.error(`   Component: ${error.componentName}`);
    }
  } else {
    console.error(`   ${error.message || error}`);
  }

  console.error('\n💡 Tips:');
  console.error('   - Make sure your Figma token is valid and has the correct permissions');
  console.error('   - Verify that the Figma URL is accessible and properly formatted');
  console.error('   - Check that you have write permissions in the output directory');
  console.error('   - Use the validate command to test your token and URL');

  process.exit(1);
}

// Show help if no command provided
if (process.argv.length <= 2) {
  program.help();
}

// Parse arguments
program.parse();