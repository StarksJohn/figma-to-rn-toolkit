import { FigmaAPIClient } from './FigmaAPIClient';
import { FigmaFile, FigmaNode, FigmaAPIError, FigmaUrlInfo } from '../types';

/**
 * Figma API wrapper class using our enhanced custom client
 * Provides high-level interface for Figma operations
 */
export class FigmaAPI {
  private client: FigmaAPIClient;
  private token: string;

  constructor(token: string) {
    this.token = token;
    this.client = new FigmaAPIClient(token);
  }

  /**
   * Parse Figma URL to extract file key and node ID
   */
  public parseUrl(url: string): FigmaUrlInfo {
    return this.client.parseUrl(url);
  }

  /**
   * Get file information from Figma
   */
  public async getFile(fileKey: string, options?: {
    version?: string;
    ids?: string[];
    depth?: number;
    geometry?: 'paths';
    plugin_data?: string;
  }): Promise<FigmaFile> {
    return this.client.getFile(fileKey, options);
  }

  /**
   * Get specific nodes from a file
   */
  public async getNodes(fileKey: string, nodeIds: string[]): Promise<{[nodeId: string]: FigmaNode}> {
    const nodes = await this.client.getNodes(fileKey, nodeIds);
    
    // Transform the response to match expected format
    const result: {[nodeId: string]: FigmaNode} = {};
    for (const [key, value] of Object.entries(nodes)) {
      // Convert node ID format if needed (13991-18999 to 13991:18999)
      const normalizedKey = key.replace(/-/g, ':');
      result[normalizedKey] = (value as any).document || value;
    }
    
    return result;
  }

  /**
   * Find a specific node by ID in the document tree
   */
  public findNodeById(document: FigmaNode, nodeId: string): FigmaNode | null {
    return this.client.findNodeById(document, nodeId);
  }

  /**
   * Get all nodes of a specific type from the document
   */
  public findNodesByType(document: FigmaNode, type: string): FigmaNode[] {
    return this.client.findNodesByType(document, type);
  }

  /**
   * Traverse all nodes in the document tree
   */
  public traverseNodes(node: FigmaNode, callback: (node: FigmaNode) => void): void {
    this.client.traverseNodes(node, callback);
  }

  /**
   * Get images for specific nodes
   */
  public async getImages(fileKey: string, nodeIds: string[], options?: {
    scale?: number;
    format?: 'jpg' | 'png' | 'svg' | 'pdf';
    svg_include_id?: boolean;
    svg_simplify_stroke?: boolean;
  }): Promise<{[nodeId: string]: string}> {
    const result = await this.client.getImages(fileKey, nodeIds, options);
    
    if (result.err) {
      throw new FigmaAPIError(`Failed to get images: ${result.err}`);
    }
    
    return result.images;
  }

  /**
   * Validate token by making a simple API call
   */
  public async validateToken(): Promise<boolean> {
    return this.client.validateToken();
  }

  /**
   * Get component from URL
   */
  public async getComponentFromUrl(url: string): Promise<FigmaNode> {
    const urlInfo = this.parseUrl(url);
    
    if (!urlInfo.nodeId) {
      // If no specific node ID, get the entire file
      const file = await this.getFile(urlInfo.fileKey);
      return file.document;
    }

    // Get specific node
    const nodes = await this.getNodes(urlInfo.fileKey, [urlInfo.nodeId]);
    const node = nodes[urlInfo.nodeId];
    
    if (!node) {
      throw new FigmaAPIError(`Node not found: ${urlInfo.nodeId}`);
    }

    return node;
  }

}