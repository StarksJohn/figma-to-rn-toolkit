/**
 * Figma MCP Usage Examples
 * Demonstrates how to use the Model Context Protocol integration
 */

import { FigmaMCPIntegration } from '../src/mcp/FigmaMCPIntegration';
import { FigmaMCPClient } from '../src/mcp/FigmaMCPClient';

/**
 * Example 1: Basic MCP connection and context retrieval
 */
async function basicMCPExample() {
  console.log('🎨 Example 1: Basic MCP Connection');
  console.log('==================================\n');
  
  // Create MCP integration
  const integration = new FigmaMCPIntegration({
    mcpUrl: 'http://127.0.0.1:3845/mcp',
    useMCP: true
  });
  
  try {
    // Connect to Figma MCP server
    const connected = await integration.connect();
    
    if (connected) {
      console.log('✅ Connected to Figma MCP server\n');
      
      // Get current context
      const context = await integration.getContext();
      
      if (context?.currentFile) {
        console.log('📂 Current File:');
        console.log(`   Name: ${context.currentFile.name}`);
        console.log(`   Key: ${context.currentFile.key}`);
        console.log(`   Last Modified: ${context.currentFile.lastModified}\n`);
      }
      
      if (context?.currentPage) {
        console.log('📄 Current Page:');
        console.log(`   Name: ${context.currentPage.name}`);
        console.log(`   ID: ${context.currentPage.id}\n`);
      }
      
      if (context?.currentSelection) {
        console.log('🎯 Current Selection:');
        console.log(`   Nodes selected: ${context.currentSelection.nodeIds.length}`);
        if (context.currentSelection.nodeIds.length > 0) {
          console.log(`   Node IDs: ${context.currentSelection.nodeIds.join(', ')}\n`);
        }
      }
      
      // Disconnect
      integration.disconnect();
      console.log('👋 Disconnected from MCP server\n');
    } else {
      console.log('❌ Failed to connect to MCP server');
      console.log('💡 Make sure Figma desktop app is running with MCP enabled\n');
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Example 2: Generate component from current selection
 */
async function generateFromSelectionExample() {
  console.log('🎯 Example 2: Generate from Selection');
  console.log('=====================================\n');
  
  const integration = new FigmaMCPIntegration({
    mcpUrl: 'http://127.0.0.1:3845/mcp',
    useMCP: true
  });
  
  try {
    // Connect to MCP
    const connected = await integration.connect();
    
    if (!connected) {
      console.log('❌ Could not connect to MCP server');
      return;
    }
    
    console.log('✅ Connected to Figma MCP server');
    console.log('💡 Select a frame or component in Figma...\n');
    
    // Generate from current selection
    const component = await integration.generateFromSelection({
      componentName: 'MyCustomComponent',
      outputPath: './generated-components',
      writeToFile: true
    });
    
    if (component) {
      console.log('✅ Component generated successfully!');
      console.log(`   Name: ${component.name}`);
      console.log(`   Props: ${Object.keys(component.props).join(', ')}`);
      console.log(`   Has styles: ${component.styles ? 'Yes' : 'No'}`);
      console.log(`   File saved to: ./generated-components/${component.name}.tsx\n`);
    } else {
      console.log('⚠️ No component generated');
      console.log('💡 Make sure you have selected something in Figma\n');
    }
    
    // Disconnect
    integration.disconnect();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    integration.disconnect();
  }
}

/**
 * Example 3: Hybrid mode - MCP with API fallback
 */
async function hybridModeExample() {
  console.log('🔄 Example 3: Hybrid Mode (MCP + API)');
  console.log('======================================\n');
  
  // Your Figma API token (replace with actual token)
  const FIGMA_TOKEN = 'YOUR_FIGMA_TOKEN_HERE';
  
  const integration = new FigmaMCPIntegration({
    mcpUrl: 'http://127.0.0.1:3845/mcp',
    token: FIGMA_TOKEN,
    useMCP: true,
    fallbackToAPI: true
  });
  
  try {
    // Try to connect via MCP
    const mcpConnected = await integration.connect();
    
    if (mcpConnected) {
      console.log('✅ Using MCP mode (real-time access)');
      
      // Can use MCP features
      const selection = await integration.generateFromSelection();
      
      if (selection) {
        console.log(`✅ Generated from selection: ${selection.name}`);
      }
    } else {
      console.log('📡 MCP not available, using API fallback mode');
      
      // Can still use URL-based generation
      const component = await integration.generateFromUrl(
        'https://www.figma.com/file/YOUR_FILE_KEY/Design?node-id=123:456',
        {
          componentName: 'MyComponent',
          outputPath: './components'
        }
      );
      
      if (component) {
        console.log(`✅ Generated from URL: ${component.name}`);
      }
    }
    
    // Disconnect if MCP was connected
    if (mcpConnected) {
      integration.disconnect();
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Example 4: Real-time event listening
 */
async function realtimeEventsExample() {
  console.log('📡 Example 4: Real-time Event Listening');
  console.log('========================================\n');
  
  // Create direct MCP client for event handling
  const mcpClient = new FigmaMCPClient('http://127.0.0.1:3845/mcp');
  
  // Setup event listeners
  mcpClient.on('connected', () => {
    console.log('🔗 Connected to Figma');
  });
  
  mcpClient.on('selectionChanged', (selection) => {
    console.log('🎯 Selection changed:', selection);
  });
  
  mcpClient.on('fileChanged', (file) => {
    console.log('📝 File changed:', file);
  });
  
  mcpClient.on('pageChanged', (page) => {
    console.log('📄 Page changed:', page);
  });
  
  try {
    // Connect to MCP server
    const connected = await mcpClient.connect();
    
    if (connected) {
      console.log('✅ Listening for Figma events...');
      console.log('💡 Try selecting different elements in Figma');
      console.log('   Press Ctrl+C to stop\n');
      
      // Keep listening for 30 seconds
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      // Disconnect
      mcpClient.disconnect();
      console.log('\n👋 Stopped listening');
    } else {
      console.log('❌ Could not connect to MCP server');
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Example 5: Get all components from current file
 */
async function listComponentsExample() {
  console.log('🧩 Example 5: List All Components');
  console.log('==================================\n');
  
  const integration = new FigmaMCPIntegration({
    mcpUrl: 'http://127.0.0.1:3845/mcp',
    useMCP: true
  });
  
  try {
    const connected = await integration.connect();
    
    if (!connected) {
      console.log('❌ Could not connect to MCP server');
      return;
    }
    
    // Get all components
    const components = await integration.getComponents();
    
    if (components.length === 0) {
      console.log('ℹ️ No components found in current file');
    } else {
      console.log(`📦 Found ${components.length} components:\n`);
      
      components.forEach((comp, index) => {
        console.log(`${index + 1}. ${comp.name || 'Unnamed'}`);
        if (comp.id) console.log(`   ID: ${comp.id}`);
        if (comp.type) console.log(`   Type: ${comp.type}`);
        if (comp.description) console.log(`   Description: ${comp.description}`);
        console.log('');
      });
    }
    
    // Get styles
    const styles = await integration.getStyles();
    
    if (styles && Object.keys(styles).length > 0) {
      console.log(`🎨 Found ${Object.keys(styles).length} styles`);
    }
    
    integration.disconnect();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    integration.disconnect();
  }
}

/**
 * Main function to run examples
 */
async function main() {
  console.log('🚀 Figma MCP Integration Examples');
  console.log('==================================\n');
  console.log('Select an example to run:\n');
  console.log('1. Basic MCP Connection');
  console.log('2. Generate from Selection');
  console.log('3. Hybrid Mode (MCP + API)');
  console.log('4. Real-time Events');
  console.log('5. List Components\n');
  
  const args = process.argv.slice(2);
  const example = args[0] || '1';
  
  switch(example) {
    case '1':
      await basicMCPExample();
      break;
    case '2':
      await generateFromSelectionExample();
      break;
    case '3':
      await hybridModeExample();
      break;
    case '4':
      await realtimeEventsExample();
      break;
    case '5':
      await listComponentsExample();
      break;
    default:
      console.log('Invalid example number. Please choose 1-5.');
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

// Export examples for use in other modules
export {
  basicMCPExample,
  generateFromSelectionExample,
  hybridModeExample,
  realtimeEventsExample,
  listComponentsExample
};