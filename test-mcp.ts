/**
 * Test script for Figma MCP functionality
 * Run: npm run test:mcp
 */

import { FigmaMCPClient } from './src/mcp/FigmaMCPClient';
import { FigmaMCPIntegration } from './src/mcp/FigmaMCPIntegration';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(50));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(50));
}

async function testMCPConnection() {
  logSection('Testing MCP Connection');
  
  const client = new FigmaMCPClient();
  
  try {
    log('Checking if MCP server is available...', colors.yellow);
    const isAvailable = await client.isAvailable();
    
    if (isAvailable) {
      log('✅ MCP server is available', colors.green);
      
      log('Attempting to connect...', colors.yellow);
      const connected = await client.connect();
      
      if (connected) {
        log('✅ Successfully connected to MCP server', colors.green);
        
        // Get capabilities
        log('Getting server capabilities...', colors.yellow);
        const capabilities = await client.getCapabilities();
        log('✅ Capabilities retrieved', colors.green);
        
        client.disconnect();
        return true;
      } else {
        log('❌ Failed to connect to MCP server', colors.red);
        return false;
      }
    } else {
      log('❌ MCP server is not available', colors.red);
      log('💡 Make sure:', colors.yellow);
      log('   1. Figma desktop app is running');
      log('   2. You have a file open in Figma');
      log('   3. Dev Mode MCP Server is enabled in Preferences');
      log('   4. You have a Professional/Organization/Enterprise account');
      return false;
    }
  } catch (error: any) {
    log(`❌ Error: ${error.message}`, colors.red);
    return false;
  }
}

async function testGetContext() {
  logSection('Testing Context Retrieval');
  
  const integration = new FigmaMCPIntegration();
  
  try {
    const connected = await integration.connect();
    
    if (!connected) {
      log('⚠️ Cannot test context - MCP not connected', colors.yellow);
      return false;
    }
    
    log('Getting current context...', colors.yellow);
    const context = await integration.getContext();
    
    if (context) {
      log('✅ Context retrieved successfully', colors.green);
      
      if (context.currentFile) {
        log(`📂 File: ${context.currentFile.name}`, colors.blue);
      }
      
      if (context.currentPage) {
        log(`📄 Page: ${context.currentPage.name}`, colors.blue);
      }
      
      if (context.currentSelection) {
        log(`🎯 Selection: ${context.currentSelection.nodeIds.length} nodes`, colors.blue);
      }
    }
    
    integration.disconnect();
    return true;
  } catch (error: any) {
    log(`❌ Error: ${error.message}`, colors.red);
    return false;
  }
}

async function testGetSelection() {
  logSection('Testing Selection Access');
  
  const client = new FigmaMCPClient();
  
  try {
    const connected = await client.connect();
    
    if (!connected) {
      log('⚠️ Cannot test selection - MCP not connected', colors.yellow);
      return false;
    }
    
    log('Getting current selection...', colors.yellow);
    const selection = await client.getCurrentSelection();
    
    if (selection && selection.nodeIds.length > 0) {
      log(`✅ Found ${selection.nodeIds.length} selected nodes`, colors.green);
      log(`   Node IDs: ${selection.nodeIds.join(', ')}`, colors.blue);
      
      // Try to get details of first node
      const nodeId = selection.nodeIds[0];
      log(`Getting details for node ${nodeId}...`, colors.yellow);
      
      const node = await client.getNodeById(nodeId);
      if (node) {
        log(`✅ Node details retrieved`, colors.green);
        log(`   Name: ${node.name}`, colors.blue);
        log(`   Type: ${node.type}`, colors.blue);
      }
    } else {
      log('ℹ️ No nodes currently selected in Figma', colors.yellow);
      log('💡 Select something in Figma and run the test again', colors.yellow);
    }
    
    client.disconnect();
    return true;
  } catch (error: any) {
    log(`❌ Error: ${error.message}`, colors.red);
    return false;
  }
}

async function testListComponents() {
  logSection('Testing Component Listing');
  
  const integration = new FigmaMCPIntegration();
  
  try {
    const connected = await integration.connect();
    
    if (!connected) {
      log('⚠️ Cannot test components - MCP not connected', colors.yellow);
      return false;
    }
    
    log('Getting all components...', colors.yellow);
    const components = await integration.getComponents();
    
    if (components.length > 0) {
      log(`✅ Found ${components.length} components`, colors.green);
      
      // Show first 5 components
      const toShow = Math.min(5, components.length);
      log(`   Showing first ${toShow} components:`, colors.blue);
      
      for (let i = 0; i < toShow; i++) {
        const comp = components[i];
        log(`   ${i + 1}. ${comp.name || 'Unnamed'}`, colors.blue);
      }
      
      if (components.length > 5) {
        log(`   ... and ${components.length - 5} more`, colors.blue);
      }
    } else {
      log('ℹ️ No components found in current file', colors.yellow);
    }
    
    integration.disconnect();
    return true;
  } catch (error: any) {
    log(`❌ Error: ${error.message}`, colors.red);
    return false;
  }
}

async function testHybridMode() {
  logSection('Testing Hybrid Mode (MCP + API Fallback)');
  
  // This would need a real token to test API fallback
  const DUMMY_TOKEN = 'YOUR_FIGMA_TOKEN_HERE';
  
  const integration = new FigmaMCPIntegration({
    token: DUMMY_TOKEN,
    useMCP: true,
    fallbackToAPI: true
  });
  
  try {
    log('Attempting MCP connection...', colors.yellow);
    const mcpConnected = await integration.connect();
    
    if (mcpConnected) {
      log('✅ Using MCP mode', colors.green);
      log('   - Real-time selection access: Available', colors.blue);
      log('   - Event listening: Available', colors.blue);
    } else {
      log('📡 MCP not available, would fall back to API mode', colors.yellow);
      log('   - URL-based access: Available (with valid token)', colors.blue);
      log('   - Real-time features: Not available', colors.blue);
    }
    
    if (mcpConnected) {
      integration.disconnect();
    }
    
    return true;
  } catch (error: any) {
    log(`❌ Error: ${error.message}`, colors.red);
    return false;
  }
}

async function runAllTests() {
  console.clear();
  log('🧪 Figma MCP Test Suite', colors.bright + colors.cyan);
  log('========================\n', colors.cyan);
  
  const tests = [
    { name: 'MCP Connection', fn: testMCPConnection },
    { name: 'Get Context', fn: testGetContext },
    { name: 'Get Selection', fn: testGetSelection },
    { name: 'List Components', fn: testListComponents },
    { name: 'Hybrid Mode', fn: testHybridMode }
  ];
  
  const results: { name: string; passed: boolean }[] = [];
  
  for (const test of tests) {
    const passed = await test.fn();
    results.push({ name: test.name, passed });
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  logSection('Test Summary');
  
  let passedCount = 0;
  let failedCount = 0;
  
  for (const result of results) {
    if (result.passed) {
      log(`✅ ${result.name}`, colors.green);
      passedCount++;
    } else {
      log(`❌ ${result.name}`, colors.red);
      failedCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  log(`Total: ${passedCount} passed, ${failedCount} failed`, 
    failedCount > 0 ? colors.yellow : colors.green);
  
  if (failedCount === tests.length) {
    console.log('\n' + '⚠️'.repeat(25));
    log('All tests failed - MCP server appears to be unavailable', colors.red);
    log('This is expected if:', colors.yellow);
    log('1. Figma desktop app is not running');
    log('2. MCP Server is not enabled in Figma Preferences');
    log('3. You have a free Figma account (Pro required)');
    console.log('⚠️'.repeat(25));
  }
}

// Run tests
runAllTests().catch(console.error);