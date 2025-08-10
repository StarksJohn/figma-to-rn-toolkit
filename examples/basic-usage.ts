/**
 * Basic usage examples for Figma to React Native converter
 */

import { FigmaToReactNative, createConverter } from '../index';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Figma token from environment variable
const FIGMA_TOKEN = process.env.FIGMA_TOKEN || '';

if (!FIGMA_TOKEN) {
  console.error('Error: FIGMA_TOKEN environment variable is not set');
  console.error('Please create a .env file with FIGMA_TOKEN=your_token_here');
  process.exit(1);
}

// Example 1: Basic component generation
async function basicExample() {
  // Create converter instance
  const converter = new FigmaToReactNative(FIGMA_TOKEN);

  try {
    // Generate component from Figma URL
    const componentSpec = await converter.generateComponentFromUrl(
      'https://www.figma.com/design/Wa0Oa4oeMTy5H2Tk32ooqb/CSM?node-id=13991-18999&m=dev',
      {
        componentName: 'CustomButton',
        outputPath: './src/components/generated',
        writeToFile: true
      }
    );

    console.log('Generated component:', componentSpec.name);
    console.log('Component code:', componentSpec.component);
  } catch (error) {
    console.error('Error generating component:', error);
  }
}

// Example 2: Using the convenience factory
async function factoryExample() {
  const converter = createConverter(FIGMA_TOKEN, {
    outputPath: './components',
    includeTypes: true,
    useStyleSheet: true,
    generateTests: true
  });

  const componentSpec = await converter.generateComponentFromUrl(
    'https://www.figma.com/design/Wa0Oa4oeMTy5H2Tk32ooqb/CSM?node-id=13991-18999&m=dev'
  );

  console.log('Generated with tests:', componentSpec);
}

// Example 3: Preview before generation
async function previewExample() {
  const converter = new FigmaToReactNative(FIGMA_TOKEN);

  // Get preview information
  const preview = await converter.getComponentPreview(
    'https://www.figma.com/design/Wa0Oa4oeMTy5H2Tk32ooqb/CSM?node-id=13991-18999&m=dev'
  );

  console.log('Component preview:');
  console.log('- Name:', preview.name);
  console.log('- Type:', preview.analysis.componentType);
  console.log('- Has text:', preview.analysis.hasText);
  console.log('- Colors used:', preview.colors);
  console.log('- Fonts used:', preview.fonts);
  console.log('- Warnings:', preview.validation.warnings);
}

// Example 4: Batch generation
async function batchExample() {
  const converter = new FigmaToReactNative(FIGMA_TOKEN);

  const urls = [
    'https://www.figma.com/design/Wa0Oa4oeMTy5H2Tk32ooqb/CSM?node-id=13991-18999&m=dev',
    // Add more URLs here
  ];

  const results = await converter.generateMultipleComponents(urls, {
    outputPath: './src/components/batch',
    writeToFile: true,
    concurrency: 2
  });

  console.log(`Generated ${results.length} components`);
}

// Example 5: Custom generation options
async function customOptionsExample() {
  const converter = new FigmaToReactNative(FIGMA_TOKEN, {
    outputPath: './src/components/custom',
    includeTypes: true,
    useStyleSheet: false, // Use inline styles
    generateTests: true,
    formatCode: true
  });

  const componentSpec = await converter.generateComponentFromUrl(
    'https://www.figma.com/design/Wa0Oa4oeMTy5H2Tk32ooqb/CSM?node-id=13991-18999&m=dev',
    {
      componentName: 'InlineStyledComponent'
    }
  );

  console.log('Generated with inline styles:', componentSpec);
}

// Example 6: Error handling
async function errorHandlingExample() {
  const converter = new FigmaToReactNative('invalid_token'); // Intentionally invalid for testing

  try {
    // This will fail
    await converter.generateComponentFromUrl('invalid_url');
  } catch (error) {
    if (error.name === 'FigmaAPIError') {
      console.error('Figma API error:', error.message);
    } else if (error.name === 'GenerationError') {
      console.error('Generation error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Example 7: Token validation
async function validateTokenExample() {
  const converter = new FigmaToReactNative(FIGMA_TOKEN);

  const isValid = await converter.validateToken();
  console.log('Token is valid:', isValid);
}

// Run examples
async function runExamples() {
  console.log('Running Figma to React Native examples...\n');

  console.log('1. Basic Example:');
  await basicExample();

  console.log('\n2. Factory Example:');
  await factoryExample();

  console.log('\n3. Preview Example:');
  await previewExample();

  console.log('\n4. Token Validation Example:');
  await validateTokenExample();

  // Uncomment to run other examples
  // await batchExample();
  // await customOptionsExample();
  // await errorHandlingExample();
}

// Export for use in other files
export {
  basicExample,
  factoryExample,
  previewExample,
  batchExample,
  customOptionsExample,
  errorHandlingExample,
  validateTokenExample,
  runExamples
};

// Run if called directly
if (require.main === module) {
  runExamples().catch(console.error);
}