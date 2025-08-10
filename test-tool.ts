#!/usr/bin/env node

/**
 * Test script to verify the Figma to React Native tool
 */

import { FigmaToReactNative } from './index';
import { FigmaUtils } from './src/utils/figmaUtils';
import { StringUtils } from './src/utils/stringUtils';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test configuration
const TEST_CONFIG = {
  token: process.env.FIGMA_TOKEN || '',
  url: 'https://www.figma.com/design/Wa0Oa4oeMTy5H2Tk32ooqb/CSM?node-id=13991-18999&m=dev',
  outputPath: './test-output'
};

// Check if token is provided
if (!TEST_CONFIG.token) {
  console.error('❌ Error: FIGMA_TOKEN environment variable is not set');
  console.error('   Please create a .env file with FIGMA_TOKEN=your_token_here');
  process.exit(1);
}

async function runTests() {
  console.log('🧪 Figma to React Native Tool Tests');
  console.log('====================================');

  let passed = 0;
  let failed = 0;

  // Test 1: URL parsing
  try {
    console.log('\n1. Testing URL parsing...');
    const urlInfo = FigmaUtils.parseUrl(TEST_CONFIG.url);
    console.log('✅ URL parsed successfully');
    console.log(`   File Key: ${urlInfo.fileKey}`);
    console.log(`   Node ID: ${urlInfo.nodeId}`);
    passed++;
  } catch (error) {
    console.log('❌ URL parsing failed:', error.message);
    failed++;
  }

  // Test 2: Token validation format
  try {
    console.log('\n2. Testing token format validation...');
    const isValidFormat = FigmaUtils.isValidToken(TEST_CONFIG.token);
    if (isValidFormat) {
      console.log('✅ Token format is valid');
      passed++;
    } else {
      console.log('❌ Token format is invalid');
      failed++;
    }
  } catch (error) {
    console.log('❌ Token format validation failed:', error.message);
    failed++;
  }

  // Test 3: String utilities
  try {
    console.log('\n3. Testing string utilities...');
    
    const testString = 'my-component-name';
    const pascalCase = StringUtils.toPascalCase(testString);
    const camelCase = StringUtils.toCamelCase(testString);
    const identifier = StringUtils.sanitizeIdentifier('123 invalid name!');
    
    console.log(`   PascalCase: ${testString} → ${pascalCase}`);
    console.log(`   CamelCase: ${testString} → ${camelCase}`);
    console.log(`   Sanitized: "123 invalid name!" → ${identifier}`);
    
    if (pascalCase === 'MyComponentName' && camelCase === 'myComponentName') {
      console.log('✅ String utilities working correctly');
      passed++;
    } else {
      console.log('❌ String utilities not working as expected');
      failed++;
    }
  } catch (error) {
    console.log('❌ String utilities test failed:', error.message);
    failed++;
  }

  // Test 4: Component name validation
  try {
    console.log('\n4. Testing component name validation...');
    
    const validName = 'MyComponent';
    const invalidName = 'my-invalid-component';
    
    const validResult = FigmaUtils.validateComponentName(validName);
    const invalidResult = FigmaUtils.validateComponentName(invalidName);
    
    if (validResult.isValid && !invalidResult.isValid) {
      console.log('✅ Component name validation working correctly');
      console.log(`   Valid: "${validName}" → ${validResult.isValid}`);
      console.log(`   Invalid: "${invalidName}" → ${invalidResult.isValid}`);
      if (invalidResult.suggestions) {
        console.log(`   Suggestions: ${invalidResult.suggestions.join(', ')}`);
      }
      passed++;
    } else {
      console.log('❌ Component name validation not working as expected');
      failed++;
    }
  } catch (error) {
    console.log('❌ Component name validation test failed:', error.message);
    failed++;
  }

  // Test 5: Converter initialization
  try {
    console.log('\n5. Testing converter initialization...');
    
    const converter = new FigmaToReactNative(TEST_CONFIG.token, {
      outputPath: TEST_CONFIG.outputPath,
      includeTypes: true,
      useStyleSheet: true,
      generateTests: false
    });
    
    console.log('✅ Converter initialized successfully');
    passed++;
  } catch (error) {
    console.log('❌ Converter initialization failed:', error.message);
    failed++;
  }

  // Test 6: Token authentication (requires network)
  try {
    console.log('\n6. Testing token authentication...');
    
    const converter = new FigmaToReactNative(TEST_CONFIG.token);
    const isValid = await converter.validateToken();
    
    if (isValid) {
      console.log('✅ Token authentication successful');
      passed++;
    } else {
      console.log('❌ Token authentication failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ Token authentication test failed:', error.message);
    failed++;
  }

  // Test 7: Component preview (requires network)
  try {
    console.log('\n7. Testing component preview...');
    
    const converter = new FigmaToReactNative(TEST_CONFIG.token);
    const preview = await converter.getComponentPreview(TEST_CONFIG.url);
    
    console.log('✅ Component preview successful');
    console.log(`   Component Name: ${preview.name}`);
    console.log(`   Component Type: ${preview.analysis.componentType}`);
    console.log(`   Has Text: ${preview.analysis.hasText}`);
    console.log(`   Colors: ${preview.colors.length}`);
    console.log(`   Fonts: ${preview.fonts.length}`);
    passed++;
  } catch (error) {
    console.log('❌ Component preview failed:', error.message);
    console.log('   Note: This might fail if the Figma URL is not accessible');
    failed++;
  }

  // Test 8: Component generation (requires network)
  try {
    console.log('\n8. Testing component generation...');
    
    const converter = new FigmaToReactNative(TEST_CONFIG.token, {
      outputPath: TEST_CONFIG.outputPath,
      includeTypes: true,
      useStyleSheet: true
    });
    
    const componentSpec = await converter.generateComponentFromUrl(TEST_CONFIG.url, {
      componentName: 'TestComponent',
      writeToFile: false // Don't write to file for testing
    });
    
    console.log('✅ Component generation successful');
    console.log(`   Generated Component: ${componentSpec.name}`);
    console.log(`   Imports: ${componentSpec.imports.length} lines`);
    console.log(`   Interfaces: ${componentSpec.interfaces.length} definitions`);
    console.log(`   Has Styles: ${componentSpec.styles ? 'Yes' : 'No'}`);
    passed++;
  } catch (error) {
    console.log('❌ Component generation failed:', error.message);
    console.log('   Note: This might fail if the Figma URL is not accessible');
    failed++;
  }

  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('======================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! The tool is ready to use.');
    console.log('\n💡 Next steps:');
    console.log('   1. Update the token in examples/basic-usage.ts');
    console.log('   2. Update the Figma URL with your own component');
    console.log('   3. Run: node cli.js generate --token=YOUR_TOKEN --url=YOUR_URL');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
    console.log('\n💡 Common issues:');
    console.log('   - Invalid Figma token (check format and permissions)');
    console.log('   - Inaccessible Figma URL (check sharing settings)');
    console.log('   - Network connectivity issues');
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Additional utility tests
function runUtilityTests() {
  console.log('\n🔧 Running Utility Tests...\n');

  // Test URL patterns
  const testUrls = [
    'https://www.figma.com/design/ABC123/Test?node-id=1-2',
    'https://www.figma.com/file/ABC123/Test?node-id=1-2',
    'https://www.figma.com/design/ABC123/Test',
    'invalid-url'
  ];

  testUrls.forEach((url, index) => {
    try {
      const isValid = FigmaUtils.isValidFigmaUrl(url);
      console.log(`   URL ${index + 1}: ${isValid ? '✅' : '❌'} ${url}`);
    } catch (error) {
      console.log(`   URL ${index + 1}: ❌ ${url} (${error.message})`);
    }
  });

  // Test token patterns
  const testTokens = [
    'figd_' + 'x'.repeat(39), // Example valid format token
    'invalid_token',
    'figd_short',
    ''
  ];

  console.log('\n');
  testTokens.forEach((token, index) => {
    const isValid = FigmaUtils.isValidToken(token);
    const masked = FigmaUtils.maskToken(token);
    console.log(`   Token ${index + 1}: ${isValid ? '✅' : '❌'} ${masked}`);
  });
}

// Main execution
if (require.main === module) {
  console.log('Starting comprehensive tests...\n');
  
  runUtilityTests();
  
  runTests().catch(error => {
    console.error('\n💥 Test runner crashed:', error);
    process.exit(1);
  });
}

export { runTests, runUtilityTests };