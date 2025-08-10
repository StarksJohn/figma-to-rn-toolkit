#!/usr/bin/env node

/**
 * Figma MCP Command Line Interface
 * For real-time Figma design access using Model Context Protocol
 */

import { Command } from 'commander';
import { FigmaMCPIntegration } from './src/mcp/FigmaMCPIntegration';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

// Package information
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

program
  .name('figma-mcp')
  .description('Figma MCP - Real-time design access using Model Context Protocol')
  .version(packageJson.version);

// MCP connect command
program
  .command('connect')
  .description('Connect to Figma MCP server')
  .option('--url <url>', 'MCP server URL', 'http://127.0.0.1:3845/mcp')
  .option('-t, --token <token>', 'Figma API token for fallback')
  .action(async (options) => {
    console.log('🎨 Figma MCP Client');
    console.log('==================');
    
    const integration = new FigmaMCPIntegration({
      mcpUrl: options.url,
      token: options.token,
      useMCP: true,
      fallbackToAPI: !!options.token
    });
    
    try {
      const connected = await integration.connect();
      
      if (connected) {
        console.log('✅ Successfully connected to Figma MCP server');
        
        // Get initial context
        const context = await integration.getContext();
        if (context?.currentFile) {
          console.log(`📂 Current file: ${context.currentFile.name}`);
        }
        if (context?.currentPage) {
          console.log(`📄 Current page: ${context.currentPage.name}`);
        }
        
        // Keep connection alive for interactive mode
        console.log('\n💡 MCP server is running. Press Ctrl+C to disconnect.');
        
        // Setup graceful shutdown
        process.on('SIGINT', () => {
          console.log('\n👋 Disconnecting...');
          integration.disconnect();
          process.exit(0);
        });
        
        // Keep process alive
        await new Promise(() => {});
      } else {
        console.log('❌ Failed to connect to MCP server');
        console.log('💡 Make sure:');
        console.log('   1. Figma desktop app is running');
        console.log('   2. You have a file open in Figma');
        console.log('   3. Dev Mode MCP Server is enabled in Preferences');
        console.log('   4. You have a Figma Professional account or higher');
      }
    } catch (error: any) {
      console.error('❌ Connection error:', error.message);
      process.exit(1);
    }
  });

// Generate from selection command
program
  .command('generate-selection')
  .description('Generate React Native component from current Figma selection')
  .option('-o, --output <path>', 'Output directory', './components')
  .option('-n, --name <name>', 'Component name')
  .option('--url <url>', 'MCP server URL', 'http://127.0.0.1:3845/mcp')
  .action(async (options) => {
    console.log('🎯 Generating from Figma selection...');
    
    const integration = new FigmaMCPIntegration({
      mcpUrl: options.url,
      useMCP: true
    });
    
    try {
      // Connect to MCP
      const connected = await integration.connect();
      
      if (!connected) {
        console.error('❌ Failed to connect to Figma MCP server');
        process.exit(1);
      }
      
      // Generate from selection
      const component = await integration.generateFromSelection({
        componentName: options.name,
        outputPath: options.output,
        writeToFile: true
      });
      
      if (component) {
        console.log(`✅ Successfully generated: ${component.name}`);
        console.log(`📁 Saved to: ${path.resolve(options.output, `${component.name}.tsx`)}`);
      } else {
        console.log('⚠️ No component generated');
        console.log('💡 Make sure you have selected a frame or component in Figma');
      }
      
      // Disconnect
      integration.disconnect();
    } catch (error: any) {
      console.error('❌ Generation error:', error.message);
      integration.disconnect();
      process.exit(1);
    }
  });

// Get context command
program
  .command('context')
  .description('Get current Figma context (file, page, selection)')
  .option('--url <url>', 'MCP server URL', 'http://127.0.0.1:3845/mcp')
  .action(async (options) => {
    const integration = new FigmaMCPIntegration({
      mcpUrl: options.url,
      useMCP: true
    });
    
    try {
      const connected = await integration.connect();
      
      if (!connected) {
        console.error('❌ Failed to connect to Figma MCP server');
        process.exit(1);
      }
      
      const context = await integration.getContext();
      
      console.log('📋 Current Figma Context:');
      console.log('========================');
      
      if (context?.currentFile) {
        console.log('\n📂 File:');
        console.log(`   Name: ${context.currentFile.name}`);
        console.log(`   Key: ${context.currentFile.key}`);
        console.log(`   Modified: ${context.currentFile.lastModified}`);
      }
      
      if (context?.currentPage) {
        console.log('\n📄 Page:');
        console.log(`   Name: ${context.currentPage.name}`);
        console.log(`   ID: ${context.currentPage.id}`);
      }
      
      if (context?.currentSelection) {
        console.log('\n🎯 Selection:');
        console.log(`   Nodes: ${context.currentSelection.nodeIds.length}`);
        if (context.currentSelection.nodeIds.length > 0) {
          console.log(`   IDs: ${context.currentSelection.nodeIds.join(', ')}`);
        }
      }
      
      integration.disconnect();
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      integration.disconnect();
      process.exit(1);
    }
  });

// List components command
program
  .command('list-components')
  .description('List all components in current Figma file')
  .option('--url <url>', 'MCP server URL', 'http://127.0.0.1:3845/mcp')
  .action(async (options) => {
    const integration = new FigmaMCPIntegration({
      mcpUrl: options.url,
      useMCP: true
    });
    
    try {
      const connected = await integration.connect();
      
      if (!connected) {
        console.error('❌ Failed to connect to Figma MCP server');
        process.exit(1);
      }
      
      console.log('🧩 Fetching components...');
      const components = await integration.getComponents();
      
      if (components.length === 0) {
        console.log('ℹ️ No components found in current file');
      } else {
        console.log(`\n📦 Found ${components.length} components:`);
        console.log('================================');
        
        components.forEach((comp, index) => {
          console.log(`\n${index + 1}. ${comp.name || 'Unnamed'}`);
          if (comp.id) console.log(`   ID: ${comp.id}`);
          if (comp.type) console.log(`   Type: ${comp.type}`);
          if (comp.description) console.log(`   Description: ${comp.description}`);
        });
      }
      
      integration.disconnect();
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      integration.disconnect();
      process.exit(1);
    }
  });

// Check MCP status command
program
  .command('status')
  .description('Check Figma MCP server status')
  .option('--url <url>', 'MCP server URL', 'http://127.0.0.1:3845/mcp')
  .action(async (options) => {
    console.log('🔍 Checking Figma MCP server status...');
    console.log(`   URL: ${options.url}`);
    
    const integration = new FigmaMCPIntegration({
      mcpUrl: options.url,
      useMCP: true
    });
    
    try {
      const connected = await integration.connect();
      
      if (connected) {
        console.log('✅ MCP Server Status: ONLINE');
        
        const context = await integration.getContext();
        if (context?.currentFile) {
          console.log(`✅ File Access: OK (${context.currentFile.name})`);
        } else {
          console.log('⚠️ File Access: No file open');
        }
        
        integration.disconnect();
      } else {
        console.log('❌ MCP Server Status: OFFLINE');
        console.log('\n💡 Troubleshooting tips:');
        console.log('   1. Open Figma desktop app (not browser)');
        console.log('   2. Open any design file');
        console.log('   3. Go to Figma menu → Preferences');
        console.log('   4. Enable "Dev Mode MCP Server"');
        console.log('   5. Make sure you have a Professional account or higher');
      }
    } catch (error: any) {
      console.log('❌ MCP Server Status: ERROR');
      console.log(`   Error: ${error.message}`);
    }
  });

// Interactive mode command
program
  .command('interactive')
  .description('Start interactive MCP session with real-time updates')
  .option('--url <url>', 'MCP server URL', 'http://127.0.0.1:3845/mcp')
  .option('-t, --token <token>', 'Figma API token for hybrid mode')
  .action(async (options) => {
    console.log('🎮 Starting interactive MCP session...');
    
    const integration = new FigmaMCPIntegration({
      mcpUrl: options.url,
      token: options.token,
      useMCP: true,
      fallbackToAPI: !!options.token
    });
    
    try {
      const connected = await integration.connect();
      
      if (!connected) {
        console.error('❌ Failed to connect to Figma MCP server');
        process.exit(1);
      }
      
      console.log('✅ Connected! Listening for Figma events...');
      console.log('💡 Commands:');
      console.log('   - Select something in Figma to see details');
      console.log('   - Press "g" to generate from selection');
      console.log('   - Press "c" to show context');
      console.log('   - Press "q" to quit');
      
      // Setup keyboard input
      const readline = await import('readline');
      readline.emitKeypressEvents(process.stdin);
      
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
      }
      
      process.stdin.on('keypress', async (str, key) => {
        if (key.ctrl && key.name === 'c') {
          console.log('\n👋 Goodbye!');
          integration.disconnect();
          process.exit(0);
        }
        
        switch(str) {
          case 'q':
            console.log('\n👋 Goodbye!');
            integration.disconnect();
            process.exit(0);
            break;
            
          case 'g':
            console.log('\n🎯 Generating from current selection...');
            const component = await integration.generateFromSelection({
              outputPath: './components',
              writeToFile: true
            });
            if (component) {
              console.log(`✅ Generated: ${component.name}`);
            }
            break;
            
          case 'c':
            console.log('\n📋 Current context:');
            const context = await integration.getContext();
            console.log(JSON.stringify(context, null, 2));
            break;
        }
      });
      
      // Keep process alive
      await new Promise(() => {});
      
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      integration.disconnect();
      process.exit(1);
    }
  });

// Parse and execute commands
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}