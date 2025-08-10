/**
 * Figma MCP (Model Context Protocol) Client
 * Connects to local Figma Dev Mode MCP Server for real-time design access
 */

import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';

// MCP message types
interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface MCPNotification {
  jsonrpc: '2.0';
  method: string;
  params?: any;
}

// Figma MCP specific types
interface FigmaSelection {
  fileKey: string;
  nodeIds: string[];
  nodes: any[];
}

interface FigmaContext {
  currentFile?: {
    key: string;
    name: string;
    lastModified: string;
  };
  currentSelection?: FigmaSelection;
  currentPage?: {
    id: string;
    name: string;
  };
}

/**
 * Figma MCP Client for connecting to local Figma Dev Mode server
 */
export class FigmaMCPClient extends EventEmitter {
  private baseUrl: string;
  private client: AxiosInstance;
  private sseConnection?: EventSource;
  private requestId: number = 1;
  private pendingRequests: Map<string | number, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = new Map();

  constructor(url: string = 'http://127.0.0.1:3845/mcp') {
    super();
    this.baseUrl = url;
    
    // Create HTTP client for standard requests
    this.client = axios.create({
      baseURL: this.baseUrl.replace('/mcp', ''),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
  }

  /**
   * Connect to Figma MCP server using SSE
   */
  public async connect(): Promise<boolean> {
    try {
      console.log(`🔌 Connecting to Figma MCP server at ${this.baseUrl}...`);
      
      // Test connection with a simple request
      const testResponse = await this.sendRequest('initialize', {
        clientInfo: {
          name: 'figma-to-rn-mcp-client',
          version: '1.0.0'
        }
      });
      
      if (testResponse) {
        console.log('✅ Connected to Figma MCP server');
        
        // Setup SSE connection for real-time updates
        this.setupSSEConnection();
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('❌ Failed to connect to Figma MCP server:', error.message);
      console.log('💡 Make sure:');
      console.log('   1. Figma desktop app is running');
      console.log('   2. You have a file open in Figma');
      console.log('   3. Dev Mode MCP Server is enabled in Figma Preferences');
      return false;
    }
  }

  /**
   * Setup SSE connection for real-time events
   */
  private setupSSEConnection(): void {
    if (typeof EventSource === 'undefined') {
      console.warn('⚠️ EventSource not available, SSE features disabled');
      return;
    }

    try {
      this.sseConnection = new EventSource(this.baseUrl);
      
      this.sseConnection.onopen = () => {
        console.log('📡 SSE connection established');
        this.emit('connected');
      };
      
      this.sseConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleSSEMessage(data);
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };
      
      this.sseConnection.onerror = (error) => {
        console.error('❌ SSE connection error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Failed to setup SSE connection:', error);
    }
  }

  /**
   * Handle SSE messages from Figma MCP server
   */
  private handleSSEMessage(message: MCPResponse | MCPNotification): void {
    // Check if it's a response to a pending request
    if ('id' in message && this.pendingRequests.has(message.id)) {
      const pending = this.pendingRequests.get(message.id)!;
      this.pendingRequests.delete(message.id);
      
      if (message.error) {
        pending.reject(new Error(message.error.message));
      } else {
        pending.resolve(message.result);
      }
    } 
    // Handle notifications
    else if ('method' in message && !('id' in message)) {
      this.handleNotification(message as MCPNotification);
    }
  }

  /**
   * Handle MCP notifications
   */
  private handleNotification(notification: MCPNotification): void {
    switch (notification.method) {
      case 'figma/selectionChanged':
        console.log('🎯 Selection changed in Figma');
        this.emit('selectionChanged', notification.params);
        break;
      
      case 'figma/fileChanged':
        console.log('📝 File changed in Figma');
        this.emit('fileChanged', notification.params);
        break;
      
      case 'figma/pageChanged':
        console.log('📄 Page changed in Figma');
        this.emit('pageChanged', notification.params);
        break;
      
      default:
        console.log(`📨 Received notification: ${notification.method}`);
        this.emit('notification', notification);
    }
  }

  /**
   * Send JSON-RPC request to MCP server
   */
  private async sendRequest(method: string, params?: any): Promise<any> {
    const requestId = this.requestId++;
    
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: requestId,
      method,
      params
    };
    
    console.log(`📤 Sending MCP request: ${method}`);
    
    try {
      // Try SSE first if available
      if (this.sseConnection && this.sseConnection.readyState === EventSource.OPEN) {
        return new Promise((resolve, reject) => {
          this.pendingRequests.set(requestId, { resolve, reject });
          
          // Send via POST to the MCP endpoint
          this.client.post('/mcp', request)
            .catch(error => {
              this.pendingRequests.delete(requestId);
              reject(error);
            });
          
          // Timeout after 10 seconds
          setTimeout(() => {
            if (this.pendingRequests.has(requestId)) {
              this.pendingRequests.delete(requestId);
              reject(new Error('Request timeout'));
            }
          }, 10000);
        });
      } else {
        // Fallback to direct HTTP request
        const response = await this.client.post('/mcp', request);
        
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }
        
        return response.data.result;
      }
    } catch (error: any) {
      console.error(`❌ MCP request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get current selection from Figma
   */
  public async getCurrentSelection(): Promise<FigmaSelection | null> {
    try {
      console.log('🎯 Getting current selection from Figma...');
      
      const result = await this.sendRequest('figma/getCurrentSelection');
      
      if (result && result.nodeIds && result.nodeIds.length > 0) {
        console.log(`✅ Found ${result.nodeIds.length} selected nodes`);
        return result as FigmaSelection;
      } else {
        console.log('ℹ️ No nodes currently selected in Figma');
        return null;
      }
    } catch (error: any) {
      console.error('Failed to get current selection:', error.message);
      return null;
    }
  }

  /**
   * Get current context from Figma
   */
  public async getContext(): Promise<FigmaContext> {
    try {
      console.log('📋 Getting current context from Figma...');
      
      const result = await this.sendRequest('figma/getContext');
      
      console.log('✅ Context retrieved:');
      if (result.currentFile) {
        console.log(`   File: ${result.currentFile.name}`);
      }
      if (result.currentPage) {
        console.log(`   Page: ${result.currentPage.name}`);
      }
      if (result.currentSelection) {
        console.log(`   Selection: ${result.currentSelection.nodeIds.length} nodes`);
      }
      
      return result as FigmaContext;
    } catch (error: any) {
      console.error('Failed to get context:', error.message);
      return {};
    }
  }

  /**
   * Get node details by ID
   */
  public async getNodeById(nodeId: string): Promise<any> {
    try {
      console.log(`🔍 Getting node details for: ${nodeId}`);
      
      const result = await this.sendRequest('figma/getNode', {
        nodeId
      });
      
      if (result) {
        console.log(`✅ Node retrieved: ${result.name} (${result.type})`);
        return result;
      }
      
      return null;
    } catch (error: any) {
      console.error(`Failed to get node ${nodeId}:`, error.message);
      return null;
    }
  }

  /**
   * Get all components from current file
   */
  public async getComponents(): Promise<any[]> {
    try {
      console.log('🧩 Getting components from current file...');
      
      const result = await this.sendRequest('figma/getComponents');
      
      if (result && Array.isArray(result)) {
        console.log(`✅ Found ${result.length} components`);
        return result;
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to get components:', error.message);
      return [];
    }
  }

  /**
   * Get styles from current file
   */
  public async getStyles(): Promise<any> {
    try {
      console.log('🎨 Getting styles from current file...');
      
      const result = await this.sendRequest('figma/getStyles');
      
      if (result) {
        console.log('✅ Styles retrieved');
        return result;
      }
      
      return {};
    } catch (error: any) {
      console.error('Failed to get styles:', error.message);
      return {};
    }
  }

  /**
   * Navigate to a specific node in Figma
   */
  public async navigateToNode(nodeId: string): Promise<boolean> {
    try {
      console.log(`🧭 Navigating to node: ${nodeId}`);
      
      await this.sendRequest('figma/navigateToNode', {
        nodeId
      });
      
      console.log('✅ Navigation successful');
      return true;
    } catch (error: any) {
      console.error('Failed to navigate to node:', error.message);
      return false;
    }
  }

  /**
   * Execute a plugin command
   */
  public async executeCommand(command: string, params?: any): Promise<any> {
    try {
      console.log(`⚡ Executing command: ${command}`);
      
      const result = await this.sendRequest('figma/executeCommand', {
        command,
        params
      });
      
      console.log('✅ Command executed successfully');
      return result;
    } catch (error: any) {
      console.error('Failed to execute command:', error.message);
      throw error;
    }
  }

  /**
   * Check if MCP server is available
   */
  public async isAvailable(): Promise<boolean> {
    try {
      const response = await this.client.get('/mcp/health', {
        timeout: 2000
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Disconnect from MCP server
   */
  public disconnect(): void {
    if (this.sseConnection) {
      this.sseConnection.close();
      this.sseConnection = undefined;
    }
    
    this.pendingRequests.clear();
    this.emit('disconnected');
    
    console.log('🔌 Disconnected from Figma MCP server');
  }

  /**
   * Get server capabilities
   */
  public async getCapabilities(): Promise<any> {
    try {
      console.log('🔧 Getting server capabilities...');
      
      const result = await this.sendRequest('figma/getCapabilities');
      
      if (result) {
        console.log('✅ Capabilities retrieved:', result);
        return result;
      }
      
      return {};
    } catch (error: any) {
      console.error('Failed to get capabilities:', error.message);
      return {};
    }
  }
}

// Export singleton instance
export const mcpClient = new FigmaMCPClient();