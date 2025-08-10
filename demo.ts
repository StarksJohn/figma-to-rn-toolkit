#!/usr/bin/env node

/**
 * Simple demo script to show Figma to React Native tool functionality
 */

import { FigmaUtils } from './src/utils/figmaUtils';
import { StringUtils } from './src/utils/stringUtils';
import { ComponentParser } from './src/parser/ComponentParser';
import { StyleParser } from './src/parser/StyleParser';

function runDemo() {
  console.log('🎨 Figma to React Native Tool Demo');
  console.log('==================================\n');

  // Demo 1: URL Parsing
  console.log('1. URL Parsing Demo:');
  const testUrl = 'https://www.figma.com/design/Wa0Oa4oeMTy5H2Tk32ooqb/CSM?node-id=13991-18999&m=dev';
  
  try {
    const urlInfo = FigmaUtils.parseUrl(testUrl);
    console.log(`   ✅ Parsed URL successfully`);
    console.log(`      File Key: ${urlInfo.fileKey}`);
    console.log(`      Node ID: ${urlInfo.nodeId}`);
  } catch (error) {
    console.log(`   ❌ URL parsing failed: ${(error as Error).message}`);
  }

  // Demo 2: String Utilities
  console.log('\n2. String Utilities Demo:');
  const testNames = ['my-component', 'Button Component', 'navigation_bar', '123invalid'];
  
  testNames.forEach(name => {
    const pascalCase = StringUtils.toPascalCase(name);
    const camelCase = StringUtils.toCamelCase(name);
    const sanitized = StringUtils.sanitizeIdentifier(name);
    
    console.log(`   "${name}" →`);
    console.log(`      PascalCase: ${pascalCase}`);
    console.log(`      camelCase: ${camelCase}`);
    console.log(`      Sanitized: ${sanitized}`);
  });

  // Demo 3: Color Conversion
  console.log('\n3. Color Conversion Demo:');
  const testColors = [
    { r: 1, g: 0, b: 0, a: 1 },     // Red
    { r: 0, g: 0.5, b: 1, a: 0.8 }, // Semi-transparent blue
    { r: 0.2, g: 0.8, b: 0.4 }      // Green (no alpha)
  ];

  testColors.forEach((color, index) => {
    const colorString = StyleParser.colorToString(color);
    console.log(`   Color ${index + 1}: rgba(${color.r}, ${color.g}, ${color.b}, ${color.a || 1}) → ${colorString}`);
  });

  // Demo 4: Component Name Validation
  console.log('\n4. Component Name Validation Demo:');
  const testComponentNames = ['MyComponent', 'my-component', 'Button123', 'invalid name!', 'Component'];
  
  testComponentNames.forEach(name => {
    const validation = FigmaUtils.validateComponentName(name);
    console.log(`   "${name}": ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`);
    if (validation.errors) {
      console.log(`      Errors: ${validation.errors.join(', ')}`);
    }
    if (validation.suggestions) {
      console.log(`      Suggestions: ${validation.suggestions.join(', ')}`);
    }
  });

  // Demo 5: Mock Component Analysis
  console.log('\n5. Component Analysis Demo:');
  const mockFigmaNode = {
    id: '13991:18999',
    name: 'Login Button',
    type: 'FRAME',
    width: 200,
    height: 44,
    fills: [{ type: 'SOLID' as const, color: { r: 0, g: 0.48, b: 1 } }],
    cornerRadius: 8,
    children: [{
      id: '13991:19000',
      name: 'Button Text',
      type: 'TEXT',
      characters: 'Login',
      style: {
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 600
      }
    }]
  };

  const analysis = ComponentParser.analyzeComponent(mockFigmaNode as any);
  console.log(`   Component: ${mockFigmaNode.name}`);
  console.log(`   Type: ${analysis.componentType}`);
  console.log(`   Layout: ${analysis.layoutType}`);
  console.log(`   Has Text: ${analysis.hasText ? 'Yes' : 'No'}`);
  console.log(`   Child Count: ${analysis.childCount}`);
  console.log(`   Suggested Props: ${analysis.suggestedProps.join(', ')}`);

  // Demo 6: Style Generation
  console.log('\n6. Style Generation Demo:');
  const mockStyles = StyleParser.nodeToStyles(mockFigmaNode as any);
  console.log(`   Generated styles for "${mockFigmaNode.name}":`);
  console.log(`   ${JSON.stringify(mockStyles, null, 6)}`);

  console.log('\n✨ Demo completed successfully!');
  console.log('\n💡 To use with real Figma data:');
  console.log('   1. Get a valid Figma token from https://www.figma.com/developers/api');
  console.log('   2. Use the CLI: npm run cli -- generate --token=YOUR_TOKEN --url=YOUR_FIGMA_URL');
  console.log('   3. Check the examples/ directory for more usage patterns');
}

// Run the demo
if (require.main === module) {
  runDemo();
}

export { runDemo };