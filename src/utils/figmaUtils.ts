import { FigmaUrlInfo, FigmaAPIError } from '../types';

/**
 * Utility functions for Figma operations
 */
export class FigmaUtils {
  /**
   * Extract file key from various Figma URL formats
   */
  public static extractFileKey(url: string): string {
    const urlInfo = this.parseUrl(url);
    return urlInfo.fileKey;
  }

  /**
   * Extract node ID from Figma URL
   */
  public static extractNodeId(url: string): string | null {
    const urlInfo = this.parseUrl(url);
    return urlInfo.nodeId || null;
  }

  /**
   * Parse Figma URL to extract components
   */
  public static parseUrl(url: string): FigmaUrlInfo {
    try {
      // Remove any query parameters we don't need and normalize the URL
      const cleanUrl = url.split('#')[0]; // Remove hash
      
      // Handle different Figma URL formats
      const patterns = [
        // Modern format: https://www.figma.com/design/FILE_KEY/...?node-id=NODE_ID
        /figma\.com\/design\/([a-zA-Z0-9]+)\/.*[\?&]node-id=([0-9-]+)/,
        // Legacy format: https://www.figma.com/file/FILE_KEY/...?node-id=NODE_ID
        /figma\.com\/file\/([a-zA-Z0-9]+)\/.*[\?&]node-id=([0-9-]+)/,
        // File only: https://www.figma.com/design/FILE_KEY/
        /figma\.com\/design\/([a-zA-Z0-9]+)/,
        // File only legacy: https://www.figma.com/file/FILE_KEY/
        /figma\.com\/file\/([a-zA-Z0-9]+)/,
        // Proto format: https://www.figma.com/proto/FILE_KEY/
        /figma\.com\/proto\/([a-zA-Z0-9]+)/,
      ];

      for (const pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match) {
          return {
            fileKey: match[1],
            nodeId: match[2] ? match[2].replace(/-/g, ':') : undefined,
          };
        }
      }

      throw new FigmaAPIError(`Invalid Figma URL format: ${url}`);
    } catch (error) {
      if (error instanceof FigmaAPIError) {
        throw error;
      }
      throw new FigmaAPIError(`Failed to parse Figma URL: ${error}`);
    }
  }

  /**
   * Validate Figma URL format
   */
  public static isValidFigmaUrl(url: string): boolean {
    try {
      this.parseUrl(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate Figma URL from file key and node ID
   */
  public static generateUrl(fileKey: string, nodeId?: string): string {
    let url = `https://www.figma.com/design/${fileKey}/Generated`;
    if (nodeId) {
      const formattedNodeId = nodeId.replace(/:/g, '-');
      url += `?node-id=${formattedNodeId}`;
    }
    return url;
  }

  /**
   * Extract team ID from Figma URL (if available)
   */
  public static extractTeamId(url: string): string | null {
    const teamMatch = url.match(/team\/([a-zA-Z0-9]+)/);
    return teamMatch ? teamMatch[1] : null;
  }

  /**
   * Check if URL is a Figma component URL
   */
  public static isComponentUrl(url: string): boolean {
    return url.includes('node-id=') || url.includes('node_id=');
  }

  /**
   * Check if URL is a Figma file URL
   */
  public static isFileUrl(url: string): boolean {
    return /figma\.com\/(file|design)\/[a-zA-Z0-9]+/.test(url);
  }

  /**
   * Normalize node ID format (convert between : and - separators)
   */
  public static normalizeNodeId(nodeId: string): string {
    return nodeId.replace(/[-:]/g, ':');
  }

  /**
   * Format node ID for URL (convert : to -)
   */
  public static formatNodeIdForUrl(nodeId: string): string {
    return nodeId.replace(/:/g, '-');
  }

  /**
   * Extract version from Figma URL
   */
  public static extractVersion(url: string): string | null {
    const versionMatch = url.match(/[\?&]version=([^&]+)/);
    return versionMatch ? decodeURIComponent(versionMatch[1]) : null;
  }

  /**
   * Check if token format is valid
   */
  public static isValidToken(token: string): boolean {
    // Figma tokens typically start with 'figd_' and are around 43 characters
    return /^figd_[a-zA-Z0-9_-]{35,}$/.test(token);
  }

  /**
   * Mask token for logging (show only first and last few characters)
   */
  public static maskToken(token: string): string {
    if (token.length < 10) {
      return '***';
    }
    return token.substring(0, 5) + '***' + token.substring(token.length - 4);
  }

  /**
   * Get Figma file name from URL by making a simple request
   */
  public static getFileNameFromUrl(url: string): string {
    const match = url.match(/\/([^\/\?]+)(\?|$)/);
    if (match && match[1] !== 'design' && match[1] !== 'file') {
      return decodeURIComponent(match[1]).replace(/-/g, ' ');
    }
    return 'Untitled';
  }

  /**
   * Convert Figma coordinates to React Native coordinates
   */
  public static convertCoordinates(x: number, y: number, parentWidth?: number, parentHeight?: number): {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
  } {
    const coords: any = {};
    
    // Use absolute positioning by default
    coords.left = Math.round(x);
    coords.top = Math.round(y);
    
    // If parent dimensions are provided, we could calculate relative positioning
    if (parentWidth && parentHeight) {
      // This could be enhanced to support percentage-based positioning
      coords.left = Math.round((x / parentWidth) * 100) / 100;
      coords.top = Math.round((y / parentHeight) * 100) / 100;
    }
    
    return coords;
  }

  /**
   * Calculate responsive dimensions
   */
  public static calculateResponsiveDimensions(width: number, height: number, maxWidth = 375): {
    width: number | string;
    height: number | string;
    aspectRatio?: number;
  } {
    const aspectRatio = width / height;
    
    if (width <= maxWidth) {
      return { width: Math.round(width), height: Math.round(height) };
    }
    
    // Scale down proportionally
    const scaledWidth = maxWidth;
    const scaledHeight = maxWidth / aspectRatio;
    
    return {
      width: '100%',
      height: Math.round(scaledHeight),
      aspectRatio: aspectRatio
    };
  }

  /**
   * Generate unique identifier for caching
   */
  public static generateCacheKey(fileKey: string, nodeId?: string, version?: string): string {
    let key = fileKey;
    if (nodeId) key += `_${nodeId}`;
    if (version) key += `_${version}`;
    return key.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  /**
   * Validate component name for React Native
   */
  public static validateComponentName(name: string): {
    isValid: boolean;
    suggestions?: string[];
    errors?: string[];
  } {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Must start with uppercase letter
    if (!/^[A-Z]/.test(name)) {
      errors.push('Component name must start with an uppercase letter');
      suggestions.push(name.charAt(0).toUpperCase() + name.slice(1));
    }

    // Must contain only letters, numbers, and underscores
    if (!/^[A-Za-z0-9_]+$/.test(name)) {
      errors.push('Component name can only contain letters, numbers, and underscores');
      suggestions.push(name.replace(/[^A-Za-z0-9_]/g, ''));
    }

    // Should not be too long
    if (name.length > 50) {
      errors.push('Component name is too long (max 50 characters)');
      suggestions.push(name.substring(0, 50));
    }

    // Reserved words check
    const reservedWords = ['Component', 'React', 'View', 'Text', 'Image', 'ScrollView'];
    if (reservedWords.includes(name)) {
      errors.push(`"${name}" is a reserved word`);
      suggestions.push(`Custom${name}`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }
}