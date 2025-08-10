/**
 * Figma MCP Integration
 * Combines MCP real-time access with existing API functionality
 */

import { FigmaMCPClient } from './FigmaMCPClient';
import { FigmaAPI } from '../api/FigmaAPI';
import { ReactNativeGenerator } from '../generator/ReactNativeGenerator';
import { FigmaNode, GenerationOptions, ReactNativeComponentSpec } from '../types';

export interface MCPIntegrationOptions {
  token?: string;
  mcpUrl?: string;
  useMCP?: boolean;
  fallbackToAPI?: boolean;
}

/**
 * Integrated Figma converter supporting both MCP and API access
 */
export class FigmaMCPIntegration {
  private mcpClient: FigmaMCPClient;
  private figmaAPI?: FigmaAPI;
  private generator: ReactNativeGenerator;
  private useMCP: boolean;
  private fallbackToAPI: boolean;
  private isConnected: boolean = false;

  constructor(options: MCPIntegrationOptions = {}) {
    this.useMCP = options.useMCP !== false;
    this.fallbackToAPI = options.fallbackToAPI !== false;
    
    // Initialize MCP client
    this.mcpClient = new FigmaMCPClient(
      options.mcpUrl || 'http://127.0.0.1:3845/mcp'
    );
    
    // Initialize API client if token provided
    if (options.token) {
      this.figmaAPI = new FigmaAPI(options.token);
    }
    
    // Initialize code generator
    this.generator = new ReactNativeGenerator({
      outputPath: './components',
      includeTypes: true,
      useStyleSheet: true,
      generateTests: false,
      formatCode: true
    });
    
    // Setup MCP event listeners
    this.setupEventListeners();
  }

  /**
   * Setup MCP event listeners for real-time updates
   */
  private setupEventListeners(): void {
    this.mcpClient.on('connected', () => {
      console.log('🔗 MCP Integration: Connected to Figma');
      this.isConnected = true;
    });
    
    this.mcpClient.on('disconnected', () => {
      console.log('🔌 MCP Integration: Disconnected from Figma');
      this.isConnected = false;
    });
    
    this.mcpClient.on('selectionChanged', (selection) => {
      console.log('🎯 MCP Integration: Selection changed', selection);
    });
    
    this.mcpClient.on('fileChanged', (file) => {
      console.log('📝 MCP Integration: File changed', file);
    });
  }

  /**
   * Connect to Figma MCP server
   */
  public async connect(): Promise<boolean> {
    if (!this.useMCP) {
      console.log('ℹ️ MCP disabled, using API-only mode');
      return false;
    }
    
    try {
      console.log('🔌 Attempting to connect to Figma MCP server...');
      
      // Check if server is available
      const isAvailable = await this.mcpClient.isAvailable();
      
      if (!isAvailable) {
        console.warn('⚠️ Figma MCP server not available');
        console.log('💡 Make sure:');
        console.log('   1. Figma desktop app is running');
        console.log('   2. Dev Mode MCP Server is enabled in Figma Preferences');
        console.log('   3. You have a Figma Professional/Organization/Enterprise account');
        
        if (this.fallbackToAPI && this.figmaAPI) {
          console.log('📡 Falling back to API mode');
          return false;
        }
        
        throw new Error('MCP server not available and fallback disabled');
      }
      
      // Connect to MCP server
      const connected = await this.mcpClient.connect();
      this.isConnected = connected;
      
      if (connected) {
        // Get initial context
        const context = await this.mcpClient.getContext();
        if (context.currentFile) {
          console.log(`📂 Connected to file: ${context.currentFile.name}`);
        }
      }
      
      return connected;
    } catch (error: any) {
      console.error('❌ Failed to connect to MCP:', error.message);
      
      if (this.fallbackToAPI) {
        console.log('📡 Using API fallback mode');
        return false;
      }
      
      throw error;
    }
  }

  /**
   * Generate component from current Figma selection
   */
  public async generateFromSelection(options?: {
    componentName?: string;
    outputPath?: string;
    writeToFile?: boolean;
  }): Promise<ReactNativeComponentSpec | null> {
    if (!this.isConnected) {
      console.error('❌ Not connected to Figma MCP server');
      console.log('💡 Run "connect()" first or use "generateFromUrl()" with API token');
      return null;
    }
    
    try {
      console.log('🎯 Getting current selection from Figma...');
      
      // Get current selection
      const selection = await this.mcpClient.getCurrentSelection();
      
      if (!selection || selection.nodeIds.length === 0) {
        console.log('⚠️ No nodes selected in Figma');
        console.log('💡 Select a frame or component in Figma and try again');
        return null;
      }
      
      console.log(`✅ Found ${selection.nodeIds.length} selected nodes`);
      
      // Get node details
      const nodeId = selection.nodeIds[0]; // Use first selected node
      const node = await this.mcpClient.getNodeById(nodeId);
      
      if (!node) {
        console.error('❌ Failed to get node details');
        return null;
      }
      
      console.log(`📦 Generating component from: ${node.name} (${node.type})`);
      
      // Generate component using existing generator
      const componentSpec = this.generator.generateComponent(
        node as FigmaNode, 
        options?.componentName || node.name
      );
      
      // Write to file if requested
      if (options?.writeToFile !== false) {
        await this.writeComponentToFile(componentSpec, options?.outputPath);
      }
      
      return componentSpec;
    } catch (error: any) {
      console.error('❌ Failed to generate from selection:', error.message);
      return null;
    }
  }

  /**
   * Generate component from Figma URL (using API)
   */
  public async generateFromUrl(
    url: string,
    options?: {
      componentName?: string;
      outputPath?: string;
      writeToFile?: boolean;
    }
  ): Promise<ReactNativeComponentSpec | null> {
    if (!this.figmaAPI) {
      console.error('❌ No Figma token provided for API access');
      console.log('💡 Initialize with a token to use URL-based generation');
      return null;
    }
    
    try {
      console.log(`📡 Fetching component from URL: ${url}`);
      
      // Get component using API
      const node = await this.figmaAPI.getComponentFromUrl(url);
      
      console.log(`✅ Retrieved component: ${node.name}`);
      
      // Generate component
      const componentSpec = this.generator.generateComponent(
        node,
        options?.componentName || node.name
      );
      
      // Write to file if requested
      if (options?.writeToFile !== false) {
        await this.writeComponentToFile(componentSpec, options?.outputPath);
      }
      
      return componentSpec;
    } catch (error: any) {
      console.error('❌ Failed to generate from URL:', error.message);
      return null;
    }
  }

  /**
   * Get all components from current file
   */
  public async getComponents(): Promise<any[]> {
    if (this.isConnected) {
      console.log('🧩 Getting components via MCP...');
      return await this.mcpClient.getComponents();
    } else if (this.figmaAPI) {
      console.log('🧩 MCP not available, use getComponentFromUrl() with specific URLs');
      return [];
    } else {
      console.error('❌ Neither MCP nor API available');
      return [];
    }
  }

  /**
   * Get styles from current file
   */
  public async getStyles(): Promise<any> {
    if (this.isConnected) {
      console.log('🎨 Getting styles via MCP...');
      return await this.mcpClient.getStyles();
    } else {
      console.log('🎨 MCP not available, styles extraction requires MCP connection');
      return {};
    }
  }

  /**
   * Write component to file
   */
  private async writeComponentToFile(
    componentSpec: ReactNativeComponentSpec,
    outputPath?: string
  ): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');
    
    const basePath = outputPath || './components';
    const fileName = `${componentSpec.name}.tsx`;
    const filePath = path.join(basePath, fileName);
    
    // Ensure directory exists
    await fs.promises.mkdir(basePath, { recursive: true });
    
    // Generate file content
    const fileContent = this.generator.generateFileContent(componentSpec);
    
    // Write to file
    await fs.promises.writeFile(filePath, fileContent, 'utf8');
    
    console.log(`📝 Component written to: ${path.resolve(filePath)}`);
  }

  /**
   * Disconnect from MCP server
   */
  public disconnect(): void {
    this.mcpClient.disconnect();
    this.isConnected = false;
  }

  /**
   * Check if MCP is connected
   */
  public get isMCPConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Check if API is available
   */
  public get isAPIAvailable(): boolean {
    return !!this.figmaAPI;
  }

  /**
   * Get current context from Figma
   */
  public async getContext(): Promise<any> {
    if (!this.isConnected) {
      return null;
    }
    return await this.mcpClient.getContext();
  }

  /**
   * Navigate to node in Figma
   */
  public async navigateToNode(nodeId: string): Promise<boolean> {
    if (!this.isConnected) {
      console.error('❌ MCP not connected');
      return false;
    }
    return await this.mcpClient.navigateToNode(nodeId);
  }
}