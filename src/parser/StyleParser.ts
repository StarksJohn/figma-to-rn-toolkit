import { FigmaNode, FigmaColor, FigmaFill, FigmaEffect, ReactNativeStyleProperties } from '../types';

/**
 * Style parser to convert Figma styles to React Native styles
 */
export class StyleParser {
  /**
   * Convert Figma color to React Native color string
   */
  public static colorToString(color: FigmaColor): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const a = color.a !== undefined ? color.a : 1;

    if (a === 1) {
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
  }

  /**
   * Convert Figma fill to React Native background color
   */
  public static fillToBackgroundColor(fills: FigmaFill[]): string | undefined {
    if (!fills || fills.length === 0) {
      return undefined;
    }

    // Find the first visible solid fill
    const solidFill = fills.find(fill => 
      fill.visible !== false && fill.type === 'SOLID' && fill.color
    );

    if (solidFill && solidFill.color) {
      const opacity = solidFill.opacity !== undefined ? solidFill.opacity : 1;
      const color = { ...solidFill.color, a: solidFill.color.a !== undefined ? solidFill.color.a * opacity : opacity };
      return this.colorToString(color);
    }

    return undefined;
  }

  /**
   * Convert Figma text style to React Native text style
   */
  public static textStyleToReactNative(textStyle: any, fills?: FigmaFill[]): Partial<ReactNativeStyleProperties> {
    const style: Partial<ReactNativeStyleProperties> = {};

    if (textStyle.fontFamily) {
      style.fontFamily = textStyle.fontFamily;
    }

    if (textStyle.fontSize) {
      style.fontSize = textStyle.fontSize;
    }

    if (textStyle.fontWeight) {
      // Convert Figma font weight to React Native format
      const weightMap: {[key: number]: any} = {
        100: '100',
        200: '200',
        300: '300',
        400: 'normal',
        500: '500',
        600: '600',
        700: 'bold',
        800: '800',
        900: '900'
      };
      style.fontWeight = weightMap[textStyle.fontWeight] || 'normal';
    }

    if (textStyle.textAlignHorizontal) {
      const alignMap: {[key: string]: any} = {
        'LEFT': 'left',
        'CENTER': 'center',
        'RIGHT': 'right',
        'JUSTIFIED': 'justify'
      };
      style.textAlign = alignMap[textStyle.textAlignHorizontal] || 'left';
    }

    if (textStyle.textAlignVertical) {
      const verticalAlignMap: {[key: string]: any} = {
        'TOP': 'top',
        'CENTER': 'center',
        'BOTTOM': 'bottom'
      };
      style.textAlignVertical = verticalAlignMap[textStyle.textAlignVertical] || 'auto';
    }

    if (textStyle.letterSpacing) {
      style.letterSpacing = textStyle.letterSpacing;
    }

    if (textStyle.lineHeightPx) {
      style.lineHeight = textStyle.lineHeightPx;
    }

    if (textStyle.textDecoration) {
      const decorationMap: {[key: string]: any} = {
        'NONE': 'none',
        'UNDERLINE': 'underline',
        'STRIKETHROUGH': 'line-through'
      };
      style.textDecorationLine = decorationMap[textStyle.textDecoration] || 'none';
    }

    if (textStyle.textCase) {
      const caseMap: {[key: string]: any} = {
        'ORIGINAL': 'none',
        'UPPER': 'uppercase',
        'LOWER': 'lowercase',
        'TITLE': 'capitalize'
      };
      style.textTransform = caseMap[textStyle.textCase] || 'none';
    }

    // Handle text color from fills
    if (fills && fills.length > 0) {
      const textColor = this.fillToBackgroundColor(fills);
      if (textColor) {
        style.color = textColor;
      }
    }

    return style;
  }

  /**
   * Convert Figma node to React Native styles
   */
  public static nodeToStyles(node: FigmaNode): ReactNativeStyleProperties {
    const styles: ReactNativeStyleProperties = {};

    // Position and dimensions
    if (node.x !== undefined) styles.left = node.x;
    if (node.y !== undefined) styles.top = node.y;
    if (node.width !== undefined) styles.width = node.width;
    if (node.height !== undefined) styles.height = node.height;

    // Background color from fills
    if (node.fills) {
      const backgroundColor = this.fillToBackgroundColor(node.fills);
      if (backgroundColor) {
        styles.backgroundColor = backgroundColor;
      }
    }

    // Border radius
    if (node.cornerRadius !== undefined) {
      styles.borderRadius = node.cornerRadius;
    }

    // Border from strokes
    if (node.strokes && node.strokes.length > 0) {
      const stroke = node.strokes[0];
      if (stroke.color) {
        styles.borderColor = this.colorToString(stroke.color);
        styles.borderWidth = 1; // Default border width
        styles.borderStyle = 'solid';
      }
    }

    // Opacity
    if (node.opacity !== undefined && node.opacity !== 1) {
      styles.opacity = node.opacity;
    }

    // Auto Layout properties (Flexbox)
    if (node.layoutMode) {
      if (node.layoutMode === 'HORIZONTAL') {
        styles.flexDirection = 'row';
      } else if (node.layoutMode === 'VERTICAL') {
        styles.flexDirection = 'column';
      }

      // Padding
      if (node.paddingLeft !== undefined) styles.paddingLeft = node.paddingLeft;
      if (node.paddingRight !== undefined) styles.paddingRight = node.paddingRight;
      if (node.paddingTop !== undefined) styles.paddingTop = node.paddingTop;
      if (node.paddingBottom !== undefined) styles.paddingBottom = node.paddingBottom;

      // Item spacing (gap)
      if (node.itemSpacing !== undefined) {
        // React Native doesn't have gap property, we'll need to handle this in component generation
        // For now, we can add it as a custom property
        (styles as any).itemSpacing = node.itemSpacing;
      }

      // Alignment
      if (node.primaryAxisAlignItems) {
        const alignMap: {[key: string]: any} = {
          'MIN': 'flex-start',
          'CENTER': 'center',
          'MAX': 'flex-end',
          'SPACE_BETWEEN': 'space-between'
        };
        styles.justifyContent = alignMap[node.primaryAxisAlignItems] || 'flex-start';
      }

      if (node.counterAxisAlignItems) {
        const alignMap: {[key: string]: any} = {
          'MIN': 'flex-start',
          'CENTER': 'center',
          'MAX': 'flex-end'
        };
        styles.alignItems = alignMap[node.counterAxisAlignItems] || 'flex-start';
      }
    }

    // Text styles
    if (node.style) {
      const textStyles = this.textStyleToReactNative(node.style, node.fills);
      Object.assign(styles, textStyles);
    }

    // Effects (shadows)
    if (node.effects && node.effects.length > 0) {
      const shadowEffect = node.effects.find(effect => 
        effect.type === 'DROP_SHADOW' && effect.visible !== false
      );
      
      if (shadowEffect) {
        if (shadowEffect.color) {
          styles.shadowColor = this.colorToString(shadowEffect.color);
        }
        if (shadowEffect.offset) {
          styles.shadowOffset = {
            width: shadowEffect.offset.x,
            height: shadowEffect.offset.y
          };
        }
        if (shadowEffect.radius !== undefined) {
          styles.shadowRadius = shadowEffect.radius;
        }
        // Set default shadow opacity if not specified
        styles.shadowOpacity = shadowEffect.color?.a || 0.3;
        
        // For Android
        styles.elevation = shadowEffect.radius || 3;
      }
    }

    return styles;
  }

  /**
   * Convert styles object to React Native StyleSheet format string
   */
  public static stylesToString(styles: ReactNativeStyleProperties, indentLevel: number = 1): string {
    const indent = '  '.repeat(indentLevel);
    const entries = Object.entries(styles);
    
    if (entries.length === 0) {
      return '{}';
    }

    const styleStrings = entries.map(([key, value]) => {
      let valueStr: string;
      
      if (typeof value === 'string') {
        valueStr = `'${value}'`;
      } else if (typeof value === 'object' && value !== null) {
        // Handle nested objects like shadowOffset
        const nestedEntries = Object.entries(value);
        const nestedStrings = nestedEntries.map(([nestedKey, nestedValue]) => {
          return `${nestedKey}: ${typeof nestedValue === 'string' ? `'${nestedValue}'` : nestedValue}`;
        });
        valueStr = `{ ${nestedStrings.join(', ')} }`;
      } else {
        valueStr = String(value);
      }
      
      return `${indent}${key}: ${valueStr}`;
    });

    return `{\n${styleStrings.join(',\n')}\n${indent.slice(2)}}`;
  }

  /**
   * Generate optimized styles by removing default values
   */
  public static optimizeStyles(styles: ReactNativeStyleProperties): ReactNativeStyleProperties {
    const optimized = { ...styles };

    // Remove default values
    if (optimized.opacity === 1) delete optimized.opacity;
    if (optimized.borderWidth === 0) delete optimized.borderWidth;
    if (optimized.borderRadius === 0) delete optimized.borderRadius;
    if (optimized.padding === 0) delete optimized.padding;
    if (optimized.margin === 0) delete optimized.margin;
    if (optimized.flex === 0) delete optimized.flex;

    return optimized;
  }

  /**
   * Merge multiple style objects
   */
  public static mergeStyles(...styles: Partial<ReactNativeStyleProperties>[]): ReactNativeStyleProperties {
    return Object.assign({}, ...styles);
  }
}