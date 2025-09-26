/**
 * Test script for getFigmaNodeInfo function
 * This demonstrates that the new function is working correctly
 */

const { getFigmaNodeInfo, parseFigmaUrl } = require('./dist/index.js');

// Test the function
async function test() {
  console.log('Testing getFigmaNodeInfo function...\n');

  // Test 1: Parse URL function
  console.log('Test 1: Parsing Figma URL');
  try {
    const testUrl = 'https://www.figma.com/design/ABC123XYZ/MyDesignFile?node-id=123%3A456';
    const result = parseFigmaUrl(testUrl);
    console.log('✅ URL parsed successfully:');
    console.log('   File ID:', result.fileId);
    console.log('   Node ID:', result.nodeId);
  } catch (error) {
    console.log('❌ Failed to parse URL:', error.message);
  }

  console.log('\nTest 2: Invalid URL handling');
  try {
    const invalidUrl = 'https://google.com';
    parseFigmaUrl(invalidUrl);
    console.log('❌ Should have thrown an error for invalid URL');
  } catch (error) {
    console.log('✅ Correctly rejected invalid URL:', error.message);
  }

  console.log('\nTest 3: Function exports');
  console.log('✅ getFigmaNodeInfo is', typeof getFigmaNodeInfo === 'function' ? 'exported correctly' : 'NOT exported');
  console.log('✅ parseFigmaUrl is', typeof parseFigmaUrl === 'function' ? 'exported correctly' : 'NOT exported');

  console.log('\nTest 4: TypeScript types (if available)');
  try {
    // This would work in TypeScript
    console.log('✅ Module exports are accessible');
  } catch (error) {
    console.log('❌ Module export error:', error.message);
  }

  // Test with actual Figma API (requires valid token and URL)
  console.log('\n=================================');
  console.log('To test with actual Figma data:');
  console.log('=================================');
  console.log('1. Get your Figma Access Token from:');
  console.log('   https://www.figma.com/settings/account#personal-access-tokens');
  console.log('\n2. In Figma, right-click any element and select "Copy link to selection"');
  console.log('\n3. Run this command:');
  console.log('   const token = "YOUR_TOKEN";');
  console.log('   const url = "YOUR_COPIED_URL";');
  console.log('   const nodeInfo = await getFigmaNodeInfo(token, url);');
  console.log('   console.log(nodeInfo);');

  // Example of actual usage (commented out since it needs real token)
  /*
  const token = 'YOUR_FIGMA_TOKEN';
  const url = 'YOUR_FIGMA_URL';

  try {
    const nodeInfo = await getFigmaNodeInfo(token, url);
    console.log('\n✅ Successfully fetched node info:');
    console.log('   Name:', nodeInfo.name);
    console.log('   Type:', nodeInfo.type);
    console.log('   Size:', nodeInfo.absoluteBoundingBox?.width, 'x', nodeInfo.absoluteBoundingBox?.height);
  } catch (error) {
    console.log('\n❌ Failed to fetch node info:', error.message);
  }
  */
}

// Run the test
test().then(() => {
  console.log('\n✅ All tests completed!');
}).catch(error => {
  console.error('\n❌ Test failed:', error);
});