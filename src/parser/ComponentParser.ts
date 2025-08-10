import { FigmaNode, ReactNativeComponentSpec, ParseError } from '../types';
import { StyleParser } from './StyleParser';

/**
 * Component parser to analyze Figma nodes and extract component structure
 */
export class ComponentParser {
  /**
   * Map Figma node types to React Native components
   */
  private static readonly NODE_TO_COMPONENT_MAP: {[key: string]: string} = {
    'FRAME': 'View',
    'RECTANGLE': 'View',
    'ELLIPSE': 'View',
    'POLYGON': 'View',
    'STAR': 'View',
    'VECTOR': 'View',
    'TEXT': 'Text',
    'GROUP': 'View',
    'COMPONENT': 'View',
    'INSTANCE': 'View',
    'BOOLEAN_OPERATION': 'View',
    'LINE': 'View'
  };

  /**
   * Convert Figma node type to React Native component
   */
  public static getComponentType(node: FigmaNode): string {
    return this.NODE_TO_COMPONENT_MAP[node.type] || 'View';
  }

  /**
   * Check if node should be rendered as an image
   */
  public static shouldRenderAsImage(node: FigmaNode): boolean {
    // Complex vector graphics, boolean operations, etc. should be rendered as images
    const imageTypes = ['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON'];
    return imageTypes.includes(node.type);
  }

  /**
   * Generate a safe component name from Figma node name
   */
  public static generateComponentName(nodeName: string): string {
    // Remove special characters and spaces, convert to PascalCase
    let name = nodeName
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');

    // Ensure it starts with a capital letter
    if (name.length === 0 || !name.match(/^[A-Z]/)) {
      name = 'Component' + name;
    }

    return name;
  }

  /**
   * Generate a safe style name from Figma node name
   */
  public static generateStyleName(nodeName: string): string {
    // Convert to camelCase for style names
    let name = nodeName
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');

    // Ensure it's a valid identifier
    if (name.length === 0 || !name.match(/^[a-zA-Z]/)) {
      name = 'container' + name.charAt(0).toUpperCase() + name.slice(1);
    }

    return name;
  }

  /**
   * Extract text content from a text node
   */
  public static extractTextContent(node: FigmaNode): string {
    if (node.type === 'TEXT' && node.characters) {
      return node.characters;
    }
    return '';
  }

  /**
   * Check if node has children that should be rendered
   */
  public static hasRenderableChildren(node: FigmaNode): boolean {
    return !!(node.children && node.children.some(child => 
      child.visible !== false && this.shouldRenderNode(child)
    ));
  }

  /**
   * Check if node should be rendered
   */
  public static shouldRenderNode(node: FigmaNode): boolean {
    // Skip invisible nodes
    if (node.visible === false) {
      return false;
    }

    // Skip nodes with no content and no children
    if (!this.hasVisualContent(node) && !this.hasRenderableChildren(node)) {
      return false;
    }

    return true;
  }

  /**
   * Check if node has visual content (fills, strokes, text, etc.)
   */
  public static hasVisualContent(node: FigmaNode): boolean {
    // Text nodes
    if (node.type === 'TEXT' && node.characters && node.characters.trim()) {
      return true;
    }

    // Nodes with fills
    if (node.fills && node.fills.some(fill => fill.visible !== false)) {
      return true;
    }

    // Nodes with strokes
    if (node.strokes && node.strokes.some(stroke => stroke.visible !== false)) {
      return true;
    }

    // Nodes with effects
    if (node.effects && node.effects.some(effect => effect.visible !== false)) {
      return true;
    }

    return false;
  }

  /**
   * Analyze component structure and extract information
   */
  public static analyzeComponent(node: FigmaNode): {
    componentType: string;
    hasText: boolean;
    hasImages: boolean;
    hasInteractiveElements: boolean;
    childCount: number;
    layoutType: 'flex' | 'absolute' | 'mixed';
    suggestedProps: string[];
  } {
    const componentType = this.getComponentType(node);
    let hasText = false;
    let hasImages = false;
    let hasInteractiveElements = false;
    let childCount = 0;
    let layoutType: 'flex' | 'absolute' | 'mixed' = 'absolute';
    const suggestedProps: string[] = [];

    // Check if it's a flex layout
    if (node.layoutMode) {
      layoutType = 'flex';
    }

    // Traverse children to analyze structure (with recursive checking)
    const analyzeNodeRecursively = (n: FigmaNode) => {
      if (n.type === 'TEXT') {
        hasText = true;
      }

      if (this.shouldRenderAsImage(n)) {
        hasImages = true;
      }

      // Check for potential interactive elements
      if (n.name.toLowerCase().includes('button') || 
          n.name.toLowerCase().includes('input') ||
          n.name.toLowerCase().includes('field')) {
        hasInteractiveElements = true;
      }

      // Recursively check children
      if (n.children) {
        for (const child of n.children) {
          if (this.shouldRenderNode(child)) {
            analyzeNodeRecursively(child);
          }
        }
      }
    };

    if (node.children) {
      childCount = node.children.filter(child => this.shouldRenderNode(child)).length;
      
      for (const child of node.children) {
        if (this.shouldRenderNode(child)) {
          analyzeNodeRecursively(child);
        }
      }
      // Determine if layout is mixed
      if (childCount > 1 && !node.layoutMode) {
        // Check if children are positioned absolutely or relatively
        const hasAbsolutePositioning = node.children.some(child => 
          child.x !== undefined && child.y !== undefined
        );
        if (hasAbsolutePositioning) {
          layoutType = childCount > 3 ? 'mixed' : 'absolute';
        }
      }
    }

    // Suggest props based on analysis
    if (hasText) {
      suggestedProps.push('title', 'subtitle', 'description');
    }
    if (hasInteractiveElements) {
      suggestedProps.push('onPress', 'onLongPress', 'disabled');
    }
    if (hasImages) {
      suggestedProps.push('imageSource', 'imageStyle');
    }

    return {
      componentType,
      hasText,
      hasImages,
      hasInteractiveElements,
      childCount,
      layoutType,
      suggestedProps
    };
  }

  /**
   * Extract all unique colors used in the component
   */
  public static extractColors(node: FigmaNode): string[] {
    const colors = new Set<string>();

    const extractFromNode = (n: FigmaNode) => {
      // Extract from fills
      if (n.fills) {
        for (const fill of n.fills) {
          if (fill.type === 'SOLID' && fill.color && fill.visible !== false) {
            colors.add(StyleParser.colorToString(fill.color));
          }
        }
      }

      // Extract from strokes
      if (n.strokes) {
        for (const stroke of n.strokes) {
          if (stroke.type === 'SOLID' && stroke.color && stroke.visible !== false) {
            colors.add(StyleParser.colorToString(stroke.color));
          }
        }
      }

      // Extract from effects
      if (n.effects) {
        for (const effect of n.effects) {
          if (effect.color && effect.visible !== false) {
            colors.add(StyleParser.colorToString(effect.color));
          }
        }
      }

      // Recursively extract from children
      if (n.children) {
        for (const child of n.children) {
          extractFromNode(child);
        }
      }
    };

    extractFromNode(node);
    return Array.from(colors);
  }

  /**
   * Extract all unique fonts used in the component
   */
  public static extractFonts(node: FigmaNode): Array<{
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
  }> {
    const fonts = new Map<string, {fontFamily: string, fontSize: number, fontWeight: number}>();

    const extractFromNode = (n: FigmaNode) => {
      if (n.type === 'TEXT' && n.style) {
        const key = `${n.style.fontFamily}-${n.style.fontSize}-${n.style.fontWeight}`;
        fonts.set(key, {
          fontFamily: n.style.fontFamily,
          fontSize: n.style.fontSize,
          fontWeight: n.style.fontWeight
        });
      }

      if (n.children) {
        for (const child of n.children) {
          extractFromNode(child);
        }
      }
    };

    extractFromNode(node);
    return Array.from(fonts.values());
  }

  /**
   * Generate TypeScript interface for component props
   */
  public static generatePropsInterface(
    componentName: string, 
    analysis: ReturnType<typeof ComponentParser.analyzeComponent>
  ): string {
    const props = [...analysis.suggestedProps];
    
    // Add common props
    props.push('style?');
    
    if (props.length === 1) {
      return `interface ${componentName}Props {\n  style?: ViewStyle;\n}`;
    }

    const propStrings = props.map(prop => {
      if (prop === 'style?') {
        return '  style?: ViewStyle;';
      }
      if (prop.includes('onPress') || prop.includes('onLongPress')) {
        return `  ${prop}?: () => void;`;
      }
      if (prop === 'disabled') {
        return '  disabled?: boolean;';
      }
      if (prop.includes('image')) {
        return `  ${prop}?: any;`;
      }
      return `  ${prop}?: string;`;
    });

    return `interface ${componentName}Props {\n${propStrings.join('\n')}\n}`;
  }

  /**
   * Validate component structure
   */
  public static validateComponent(node: FigmaNode): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check for valid node type
    if (!this.NODE_TO_COMPONENT_MAP[node.type]) {
      warnings.push(`Unknown node type: ${node.type}, will be rendered as View`);
    }

    // Check for potential issues
    if (node.children && node.children.length > 20) {
      warnings.push(`Component has many children (${node.children.length}), consider breaking it down`);
    }

    // Check for missing dimensions
    if (node.width === undefined || node.height === undefined) {
      warnings.push('Component has undefined dimensions');
    }

    // Check for invisible node
    if (node.visible === false) {
      warnings.push('Component is marked as invisible');
    }

    // Check for deeply nested structure
    const getDepth = (n: FigmaNode, currentDepth = 0): number => {
      if (!n.children || n.children.length === 0) {
        return currentDepth;
      }
      return Math.max(...n.children.map(child => getDepth(child, currentDepth + 1)));
    };

    const depth = getDepth(node);
    if (depth > 10) {
      warnings.push(`Component has deep nesting (${depth} levels), consider flattening`);
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }
}