import axios, { AxiosInstance, AxiosError } from 'axios';
import { FigmaFile, FigmaNode, FigmaAPIError, FigmaUrlInfo } from '../types';

/**
 * Advanced Figma API client using axios with enhanced debugging and error handling
 * Designed to be more reliable and maintainable than third-party libraries
 */
export class FigmaAPIClient {
  private client: AxiosInstance;
  private token: string;
  private baseURL = 'https://api.figma.com/v1';

  constructor(token: string) {
    this.token = token;
    
    // Create axios instance with optimized configuration
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-Figma-Token': token,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'FigmaToRN-CLI/1.0.0'
      },
      timeout: 30000, // 30 seconds timeout
      validateStatus: (status) => status < 500 // Don't throw on 4xx errors for better handling
    });

    // Enhanced request interceptor with detailed logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`📡 Figma API Request: ${config.method?.toUpperCase()} ${config.url}`);
        if (config.params && Object.keys(config.params).length > 0) {
          console.log(`   Parameters:`, config.params);
        }
        return config;
      },
      (error) => {
        console.error('❌ Request setup error:', error.message);
        return Promise.reject(error);
      }
    );

    // Enhanced response interceptor with smart error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ Figma API Response: ${response.status} ${response.statusText}`);
        if (response.data && typeof response.data === 'object') {
          const dataInfo = response.data.name ? `(${response.data.name})` : 
                          response.data.nodes ? `(${Object.keys(response.data.nodes).length} nodes)` :
                          response.data.images ? `(${Object.keys(response.data.images).length} images)` : '';
          if (dataInfo) {
            console.log(`   Data: ${dataInfo}`);
          }
        }
        return response;
      },
      (error: AxiosError) => {
        this.handleResponseError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Enhanced error handling with specific recommendations
   */
  private handleResponseError(error: AxiosError): void {
    if (error.response) {
      const { status, statusText, data } = error.response;
      console.error(`❌ API Error: ${status} ${statusText}`);
      
      // Specific error handling with user-friendly messages
      switch (status) {
        case 400:
          console.error('   💡 Bad Request: Check your URL format and parameters');
          break;
        case 403:
          console.error('   💡 Access Denied: Check your token permissions');
          console.error('   💡 Required permissions: File content (Read), Current user (Read), File metadata (Read)');
          break;
        case 404:
          console.error('   💡 Not Found: Verify the file key and node ID exist');
          break;
        case 429:
          console.error('   💡 Rate Limited: Too many requests, wait before retrying');
          break;
        case 500:
          console.error('   💡 Server Error: Figma API is experiencing issues');
          break;
        default:
          console.error(`   💡 Unexpected error: ${status}`);
      }
      
      if (data && typeof data === 'object' && (data as any).message) {
        console.error(`   Details: ${(data as any).message}`);
      }
    } else if (error.request) {
      console.error('❌ Network Error: No response received');
      console.error('   💡 Check your internet connection and firewall settings');
    } else {
      console.error('❌ Request Setup Error:', error.message);
    }
  }

  /**
   * Parse Figma URL to extract file key and node ID with enhanced validation
   */
  public parseUrl(url: string): FigmaUrlInfo {
    try {
      console.log(`🔍 Parsing Figma URL: ${url}`);
      
      // Clean URL - remove hash and normalize
      const cleanUrl = url.split('#')[0].trim();
      
      // Support for different Figma URL formats
      const patterns = [
        // Modern design URLs: https://www.figma.com/design/FILE_KEY/...?node-id=NODE_ID
        /figma\.com\/design\/([a-zA-Z0-9]+).*[\?&]node-id=([0-9%-]+)/,
        // Legacy file URLs: https://www.figma.com/file/FILE_KEY/...?node-id=NODE_ID  
        /figma\.com\/file\/([a-zA-Z0-9]+).*[\?&]node-id=([0-9%-]+)/,
        // File only URLs (modern): https://www.figma.com/design/FILE_KEY/
        /figma\.com\/design\/([a-zA-Z0-9]+)/,
        // File only URLs (legacy): https://www.figma.com/file/FILE_KEY/
        /figma\.com\/file\/([a-zA-Z0-9]+)/,
      ];

      for (const pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match) {
          // Handle URL-encoded node IDs and convert format
          const nodeId = match[2] ? 
            decodeURIComponent(match[2]).replace(/-/g, ':') : 
            undefined;
          
          const result = {
            fileKey: match[1],
            nodeId: nodeId,
          };
          
          console.log(`✅ Parsed successfully:`, result);
          return result;
        }
      }

      throw new FigmaAPIError(`Invalid Figma URL format. Expected formats:
- https://www.figma.com/design/FILE_KEY/Name?node-id=NODE_ID
- https://www.figma.com/file/FILE_KEY/Name?node-id=NODE_ID
- https://www.figma.com/design/FILE_KEY/Name (file only)`);
    } catch (error) {
      if (error instanceof FigmaAPIError) {
        throw error;
      }
      throw new FigmaAPIError(`Failed to parse Figma URL: ${error}`);
    }
  }

  /**
   * Validate token by making a user info request
   */
  public async validateToken(): Promise<boolean> {
    try {
      console.log('🔐 Validating Figma token...');
      
      // Make a simple request to test token validity
      const response = await this.client.get('/me');
      
      if (response.status === 200 && response.data) {
        const userInfo = response.data;
        console.log(`✅ Token valid for user: ${userInfo.email || userInfo.handle || 'Unknown'}`);
        return true;
      }
      
      console.log('❌ Token validation failed: Invalid response');
      return false;
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('❌ Token validation failed: Invalid or expired token');
      } else {
        console.log('❌ Token validation failed:', error.message);
      }
      return false;
    }
  }

  /**
   * Get file information from Figma with enhanced options
   */
  public async getFile(fileKey: string, options?: {
    version?: string;
    ids?: string[];
    depth?: number;
    geometry?: 'paths';
    plugin_data?: string;
    branch_data?: boolean;
  }): Promise<FigmaFile> {
    try {
      console.log(`🔍 Fetching Figma file: ${fileKey}`);
      
      const params: any = {};
      if (options?.version) params.version = options.version;
      if (options?.ids) params.ids = options.ids.join(',');
      if (options?.depth) params.depth = options.depth;
      if (options?.geometry) params.geometry = options.geometry;
      if (options?.plugin_data) params.plugin_data = options.plugin_data;
      if (options?.branch_data) params.branch_data = options.branch_data;

      const response = await this.client.get(`/files/${fileKey}`, { params });
      
      if (response.status === 200 && response.data) {
        console.log(`✅ Successfully fetched file: ${response.data.name}`);
        console.log(`   Schema version: ${response.data.schemaVersion || 'Unknown'}`);
        
        if (response.data.document?.children) {
          console.log(`   Pages: ${response.data.document.children.length}`);
        }
        
        return response.data as FigmaFile;
      }

      // Handle specific error cases with helpful messages
      throw new FigmaAPIError(
        this.getErrorMessage(response.status, 'file fetch'),
        response.status
      );
    } catch (error: any) {
      if (error instanceof FigmaAPIError) {
        throw error;
      }
      throw new FigmaAPIError(`Failed to fetch file: ${error.message}`, error.response?.status);
    }
  }

  /**
   * Get specific nodes from a file with smart ID handling
   */
  public async getNodes(fileKey: string, nodeIds: string[]): Promise<{[nodeId: string]: any}> {
    try {
      console.log(`🔍 Fetching nodes from file ${fileKey}:`, nodeIds);
      
      // Ensure node IDs are properly formatted for the API
      const formattedIds = nodeIds.map(id => id.replace(/:/g, '-'));
      
      const response = await this.client.get(`/files/${fileKey}/nodes`, {
        params: {
          ids: formattedIds.join(',')
        }
      });
      
      if (response.status === 200 && response.data?.nodes) {
        const nodeCount = Object.keys(response.data.nodes).length;
        console.log(`✅ Successfully fetched ${nodeCount} nodes`);
        
        // Log node details for debugging
        for (const [nodeId, nodeData] of Object.entries(response.data.nodes)) {
          const node = (nodeData as any)?.document || nodeData;
          if (node) {
            console.log(`   Node ${nodeId}: ${node.name || 'Unnamed'} (${node.type || 'Unknown type'})`);
          }
        }
        
        return response.data.nodes;
      }

      throw new FigmaAPIError(
        this.getErrorMessage(response.status, 'node fetch'),
        response.status
      );
    } catch (error: any) {
      if (error instanceof FigmaAPIError) {
        throw error;
      }
      throw new FigmaAPIError(`Failed to fetch nodes: ${error.message}`, error.response?.status);
    }
  }

  /**
   * Find a specific node by ID in the document tree
   */
  public findNodeById(document: FigmaNode, nodeId: string): FigmaNode | null {
    if (document.id === nodeId) {
      return document;
    }

    if (document.children) {
      for (const child of document.children) {
        const found = this.findNodeById(child, nodeId);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  /**
   * Get all nodes of a specific type from the document
   */
  public findNodesByType(document: FigmaNode, type: string): FigmaNode[] {
    const nodes: FigmaNode[] = [];

    if (document.type === type) {
      nodes.push(document);
    }

    if (document.children) {
      for (const child of document.children) {
        nodes.push(...this.findNodesByType(child, type));
      }
    }

    return nodes;
  }

  /**
   * Traverse all nodes in the document tree with callback
   */
  public traverseNodes(node: FigmaNode, callback: (node: FigmaNode) => void): void {
    callback(node);
    
    if (node.children) {
      for (const child of node.children) {
        this.traverseNodes(child, callback);
      }
    }
  }

  /**
   * Get images for specific nodes with enhanced options
   */
  public async getImages(fileKey: string, nodeIds: string[], options?: {
    scale?: number;
    format?: 'jpg' | 'png' | 'svg' | 'pdf';
    svg_include_id?: boolean;
    svg_simplify_stroke?: boolean;
    use_absolute_bounds?: boolean;
  }): Promise<{err: string | null; images: {[nodeId: string]: string}}> {
    try {
      console.log(`🎨 Fetching images for ${nodeIds.length} nodes...`);
      
      // Format node IDs for the API
      const formattedIds = nodeIds.map(id => id.replace(/:/g, '-'));
      
      const params: any = {
        ids: formattedIds.join(','),
        scale: options?.scale || 2,
        format: options?.format || 'png'
      };
      
      if (options?.svg_include_id !== undefined) params.svg_include_id = options.svg_include_id;
      if (options?.svg_simplify_stroke !== undefined) params.svg_simplify_stroke = options.svg_simplify_stroke;
      if (options?.use_absolute_bounds !== undefined) params.use_absolute_bounds = options.use_absolute_bounds;

      const response = await this.client.get(`/images/${fileKey}`, { params });
      
      if (response.status === 200 && response.data) {
        const imageCount = Object.keys(response.data.images || {}).length;
        console.log(`✅ Successfully fetched ${imageCount} images`);
        
        return {
          err: response.data.err || null,
          images: response.data.images || {}
        };
      }

      throw new FigmaAPIError(
        this.getErrorMessage(response.status, 'image fetch'),
        response.status
      );
    } catch (error: any) {
      if (error instanceof FigmaAPIError) {
        throw error;
      }
      throw new FigmaAPIError(`Failed to fetch images: ${error.message}`, error.response?.status);
    }
  }

  /**
   * Get contextual error messages for different scenarios
   */
  private getErrorMessage(status: number, operation: string): string {
    const baseMessages: {[key: number]: string} = {
      400: `Bad request during ${operation}. Check your parameters.`,
      403: `Access denied during ${operation}. Verify your token permissions.`,
      404: `Resource not found during ${operation}. Check your file key and node IDs.`,
      429: `Rate limit exceeded during ${operation}. Please wait and retry.`,
      500: `Figma server error during ${operation}. Try again later.`,
    };

    return baseMessages[status] || `Unknown error (${status}) during ${operation}`;
  }

  /**
   * Get rate limit information from response headers
   */
  public getRateLimitInfo(): {remaining: number; resetTime: number} | null {
    // This would be populated after making requests
    // Implementation depends on how Figma provides rate limit headers
    return null;
  }

  /**
   * Health check for the Figma API
   */
  public async healthCheck(): Promise<boolean> {
    try {
      console.log('🏥 Performing Figma API health check...');
      const response = await this.client.get('/me');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}