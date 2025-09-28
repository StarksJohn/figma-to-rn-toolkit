/**
 * Example: Using Figma to RN Style Conversion Utilities
 * This example shows how to use the style conversion utilities
 * to transform Figma node data into React Native styles
 */

import {
  getFigmaNodeInfo,
  figmaColorToRN,
  figmaNodeToBorderStyles,
  figmaNodeToPaddingStyles,
  figmaNodeToBackgroundStyles,
  figmaNodeToRNStyles
} from '../src';

// Replace with your actual Figma token and URL
const FIGMA_TOKEN = process.env.FIGMA_TOKEN || 'YOUR_FIGMA_TOKEN';
const FIGMA_URL = 'https://www.figma.com/design/YOUR_FILE_ID/YOUR_FILE_NAME?node-id=YOUR_NODE_ID';

async function demonstrateStyleConversion() {
  try {
    console.log('🎨 Figma to RN Style Conversion Example\n');
    console.log('========================================\n');

    // 1. Fetch Figma node information
    console.log('1. Fetching Figma node data...');
    const nodeInfo = await getFigmaNodeInfo(FIGMA_TOKEN, FIGMA_URL);
    console.log(`   ✅ Node Name: ${nodeInfo.name}`);
    console.log(`   ✅ Node Type: ${nodeInfo.type}\n`);

    // 2. Convert individual style properties
    console.log('2. Converting individual style properties:\n');

    // Border styles
    const borderStyles = figmaNodeToBorderStyles(nodeInfo);
    console.log('   Border Styles:');
    console.log('   ', JSON.stringify(borderStyles, null, 2));

    // Padding styles
    const paddingStyles = figmaNodeToPaddingStyles(nodeInfo);
    console.log('\n   Padding Styles:');
    console.log('   ', JSON.stringify(paddingStyles, null, 2));

    // Background styles
    const bgStyles = figmaNodeToBackgroundStyles(nodeInfo);
    console.log('\n   Background Styles:');
    console.log('   ', JSON.stringify(bgStyles, null, 2));

    // 3. Complete conversion
    console.log('\n3. Complete RN Style Object:\n');
    const completeStyles = figmaNodeToRNStyles(nodeInfo);
    console.log(JSON.stringify(completeStyles, null, 2));

    // 4. Example: Color conversion
    if (nodeInfo.fills && nodeInfo.fills[0]?.color) {
      console.log('\n4. Color Conversion Example:\n');
      const figmaColor = nodeInfo.fills[0].color;
      const rnColor = figmaColorToRN(figmaColor);
      console.log(`   Figma Color: ${JSON.stringify(figmaColor)}`);
      console.log(`   RN Color: ${rnColor}`);
    }

    // 5. Generate React Native StyleSheet
    console.log('\n5. React Native StyleSheet Example:\n');
    console.log('```typescript');
    console.log('import { StyleSheet } from "react-native";');
    console.log('');
    console.log('const styles = StyleSheet.create({');
    console.log('  container: {');

    Object.entries(completeStyles).forEach(([key, value]) => {
      console.log(`    ${key}: ${typeof value === 'string' ? `"${value}"` : value},`);
    });

    console.log('  }');
    console.log('});');
    console.log('```');

    console.log('\n✅ Style conversion completed successfully!');

  } catch (error) {
    console.error('❌ Error during style conversion:', error);
  }
}

// Example with mock data (for testing without Figma API)
function demonstrateWithMockData() {
  console.log('🎨 Style Conversion with Mock Data\n');
  console.log('====================================\n');

  const mockNode = {
    name: 'Payment Container',
    type: 'FRAME',
    fills: [
      {
        type: 'SOLID',
        color: { r: 1, g: 1, b: 1, a: 1 }
      }
    ],
    strokes: [
      {
        type: 'SOLID',
        color: { r: 0.8666, g: 0.8666, b: 0.8666, a: 1 }
      }
    ],
    strokeWeight: 1,
    strokeAlign: 'INSIDE',
    cornerRadius: 16,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16
  };

  console.log('Mock Figma Node:', JSON.stringify(mockNode, null, 2));
  console.log('\nConverted RN Styles:');

  const rnStyles = figmaNodeToRNStyles(mockNode);
  console.log(JSON.stringify(rnStyles, null, 2));

  console.log('\n✅ Mock data conversion completed!');
}

// Run the example
if (require.main === module) {
  // Check if we have a real Figma token
  if (FIGMA_TOKEN && FIGMA_TOKEN !== 'YOUR_FIGMA_TOKEN') {
    demonstrateStyleConversion();
  } else {
    console.log('⚠️  No Figma token found. Running with mock data...\n');
    demonstrateWithMockData();
  }
}

export { demonstrateStyleConversion, demonstrateWithMockData };