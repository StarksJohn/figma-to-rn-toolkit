/**
 * FigmaNodeFetcher - A simple utility to fetch Figma node information
 * This function can be used independently by other RN projects
 */

import axios, { AxiosInstance } from 'axios';

/**
 * Figma node information returned by the fetcher
 */
export interface FigmaNodeInfo {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  locked?: boolean;
  opacity?: number;
  blendMode?: string;
  children?: FigmaNodeInfo[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  background?: any[];
  backgroundColor?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  fills?: any[];
  strokes?: any[];
  strokeWeight?: number;
  strokeAlign?: string;
  effects?: any[];
  constraints?: {
    vertical: string;
    horizontal: string;
  };
  layoutAlign?: string;
  layoutGrow?: number;
  layoutMode?: string;
  itemSpacing?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  cornerRadius?: number;
  rectangleCornerRadii?: number[];
  styles?: any;
  [key: string]: any;
}

/**
 * Parse Figma URL to extract file ID and node ID
 * Supports various Figma URL formats:
 * - https://www.figma.com/file/{fileId}/{fileName}?node-id={nodeId}
 * - https://www.figma.com/design/{fileId}/{fileName}?node-id={nodeId}
 * - https://www.figma.com/proto/{fileId}/{fileName}?node-id={nodeId}
 */
export function parseFigmaUrl(url: string): { fileId: string; nodeId: string } {
  const urlObj = new URL(url);
  const pathSegments = urlObj.pathname.split('/').filter(Boolean);

  // Extract file ID from path
  let fileId = '';
  if (pathSegments.length >= 2) {
    // The file ID is typically the second segment after 'file', 'design', or 'proto'
    if (['file', 'design', 'proto'].includes(pathSegments[0])) {
      fileId = pathSegments[1];
    }
  }

  // Extract node ID from query parameters
  const nodeId = urlObj.searchParams.get('node-id') || '';

  if (!fileId) {
    throw new Error('Invalid Figma URL: Could not extract file ID');
  }

  if (!nodeId) {
    throw new Error('Invalid Figma URL: Could not extract node ID');
  }

  // Decode the node ID (it might be URL encoded)
  const decodedNodeId = decodeURIComponent(nodeId);

  return { fileId, nodeId: decodedNodeId };
}

/**
 * Fetch Figma node information from a Figma URL
 * This is the main function that other RN projects can use
 *
 * @param token - Your Figma Personal Access Token
 * @param url - The Figma URL (obtained from "Copy link to selection")
 * @returns Promise with the node information
 *
 * @example
 * ```typescript
 * import { getFigmaNodeInfo } from 'figma-to-rn-toolkit';
 *
 * const token = 'YOUR_FIGMA_TOKEN';
 * const url = 'https://www.figma.com/design/ABC123/MyDesign?node-id=2%3A4';
 *
 * const nodeInfo = await getFigmaNodeInfo(token, url);
 * console.log('Node name:', nodeInfo.name);
 * console.log('Node type:', nodeInfo.type);
 * ```
 */
export async function getFigmaNodeInfo(
  token: string,
  url: string
): Promise<FigmaNodeInfo> {
  if (!token) {
    throw new Error('Figma token is required');
  }

  if (!url) {
    throw new Error('Figma URL is required');
  }

  // Parse the URL to get file ID and node ID
  const { fileId, nodeId } = parseFigmaUrl(url);

  // Create axios instance with Figma API configuration
  const api: AxiosInstance = axios.create({
    baseURL: 'https://api.figma.com/v1',
    headers: {
      'X-Figma-Token': token,
    },
    timeout: 30000,
  });

  try {
    // Fetch the specific node from Figma API
    const response = await api.get(`/files/${fileId}/nodes`, {
      params: {
        ids: nodeId,
      },
    });

    // Extract the node data from the response
    const nodeData = response.data.nodes[nodeId];

    if (!nodeData) {
      throw new Error(`Node with ID ${nodeId} not found in file ${fileId}`);
    }

    // Return the document property which contains the actual node information
    return nodeData.document as FigmaNodeInfo;
  } catch (error: any) {
    if (error.response) {
      // Handle specific Figma API errors
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;

      if (status === 403) {
        throw new Error(`Figma API access denied. Please check your token permissions. ${message}`);
      } else if (status === 404) {
        throw new Error(`Figma file or node not found. Please check the URL. ${message}`);
      } else {
        throw new Error(`Figma API error (${status}): ${message}`);
      }
    } else if (error.request) {
      throw new Error('Network error: Could not connect to Figma API');
    } else {
      throw error;
    }
  }
}

/**
 * Get multiple Figma nodes information at once
 * Useful when you need to fetch multiple nodes from the same file
 *
 * @param token - Your Figma Personal Access Token
 * @param fileId - The Figma file ID
 * @param nodeIds - Array of node IDs to fetch
 * @returns Promise with a map of node IDs to node information
 */
export async function getFigmaNodesInfo(
  token: string,
  fileId: string,
  nodeIds: string[]
): Promise<Record<string, FigmaNodeInfo>> {
  if (!token) {
    throw new Error('Figma token is required');
  }

  if (!fileId) {
    throw new Error('Figma file ID is required');
  }

  if (!nodeIds || nodeIds.length === 0) {
    throw new Error('At least one node ID is required');
  }

  const api: AxiosInstance = axios.create({
    baseURL: 'https://api.figma.com/v1',
    headers: {
      'X-Figma-Token': token,
    },
    timeout: 30000,
  });

  try {
    // Fetch multiple nodes at once
    const response = await api.get(`/files/${fileId}/nodes`, {
      params: {
        ids: nodeIds.join(','),
      },
    });

    const result: Record<string, FigmaNodeInfo> = {};

    // Process each node in the response
    for (const nodeId of nodeIds) {
      const nodeData = response.data.nodes[nodeId];
      if (nodeData && nodeData.document) {
        result[nodeId] = nodeData.document as FigmaNodeInfo;
      }
    }

    return result;
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      throw new Error(`Figma API error (${status}): ${message}`);
    } else if (error.request) {
      throw new Error('Network error: Could not connect to Figma API');
    } else {
      throw error;
    }
  }
}

/**
 * Validate if a string is a valid Figma token
 * Figma tokens typically start with 'figd_' or similar pattern
 */
export function isValidFigmaToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Figma tokens are typically alphanumeric with underscores and hyphens
  // They're usually 40+ characters long
  return token.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(token);
}

/**
 * Extract all node IDs from a Figma file URL that contains multiple nodes
 * Some Figma URLs can contain multiple node IDs separated by commas
 */
export function extractNodeIds(url: string): string[] {
  const { nodeId } = parseFigmaUrl(url);

  // Node IDs might be comma-separated
  return nodeId.split(',').map(id => id.trim()).filter(Boolean);
}