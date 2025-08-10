#!/usr/bin/env node

/**
 * 直接执行脚本 - 完全绕过CLI参数问题
 */

const { FigmaToReactNative } = require('./dist/index');
require('dotenv').config();

async function runDirectly() {
  console.log('🎨 Direct Figma to React Native Converter');
  console.log('==========================================');

  // 直接设置参数，无需CLI解析
  const config = {
    token: process.env.FIGMA_TOKEN || '',
    url: "https://www.figma.com/design/Wa0Oa4oeMTy5H2Tk32ooqb/CSM?node-id=13995-19114&m=dev",
    output: "components",
    name: "CustomView"
  };

  // Check if token is provided
  if (!config.token) {
    console.error('❌ Error: FIGMA_TOKEN environment variable is not set');
    console.error('   Please create a .env file with FIGMA_TOKEN=your_token_here');
    process.exit(1);
  }

  console.log('✅ Configuration:');
  console.log(`   Token: ${config.token ? 'provided' : 'missing'}`);
  console.log(`   URL: ${config.url ? 'provided' : 'missing'}`);
  console.log(`   Output: "${config.output}"`);
  console.log(`   Name: "${config.name}"`);

  try {
    // 创建转换器
    const converter = new FigmaToReactNative(config.token, {
      outputPath: config.output
    });

    console.log('\n📡 Fetching component from Figma...');

    // 生成组件
    const componentSpec = await converter.generateComponentFromUrl(config.url, {
      componentName: config.name,
      outputPath: config.output,
      writeToFile: true
    });

    console.log(`\n✅ Successfully generated component: ${componentSpec.name}`);
    console.log(`📁 Output path: ${require('path').resolve(config.output)}`);

    // 编译检查
    console.log('\n🔍 Running TypeScript compilation check...');
    const { spawn } = require('child_process');
    const path = require('path');

    const componentFile = path.join(config.output, `${componentSpec.name}.tsx`);
    const absolutePath = path.resolve(componentFile);

    console.log(`   Checking: ${componentFile}`);

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

    let compileOutput = '';
    let compileError = '';

    tscProcess.stdout.on('data', (data) => {
      compileOutput += data.toString();
    });

    tscProcess.stderr.on('data', (data) => {
      compileError += data.toString();
    });

    await new Promise((resolve) => {
      tscProcess.on('close', (code) => {
        if (code === 0) {
          console.log('   ✅ TypeScript compilation check passed');
        } else {
          console.log('   ❌ TypeScript compilation errors found:');
          if (compileError) console.log('   Error:', compileError);
          if (compileOutput) console.log('   Output:', compileOutput);
        }
        resolve();
      });

      tscProcess.on('error', () => {
        console.log('   ⚠️ TypeScript compiler not available, skipping check');
        resolve();
      });
    });

    console.log('\n🎉 Generation completed successfully!');
    console.log(`📄 Generated file: ${absolutePath}`);

  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  }
}

// 运行
runDirectly().catch(console.error);
