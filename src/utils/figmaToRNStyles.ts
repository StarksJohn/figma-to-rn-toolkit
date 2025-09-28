/**
 * Utility functions to convert Figma node properties to React Native styles
 */

interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface FigmaStroke {
  blendMode?: string;
  type?: string;
  color?: FigmaColor;
}

/**
 * Convert Figma color object to React Native color string
 */
export function figmaColorToRN(color: FigmaColor): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a;

  if (a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Convert Figma node properties to React Native border styles
 */
export function figmaNodeToBorderStyles(node: any) {
  const styles: any = {};

  // Handle strokes (borders in RN)
  if (node.strokes && node.strokes.length > 0) {
    const stroke = node.strokes[0]; // Use first stroke
    if (stroke.type === 'SOLID' && stroke.color) {
      styles.borderColor = figmaColorToRN(stroke.color);
    }
  }

  // Handle stroke weight
  if (node.strokeWeight !== undefined) {
    styles.borderWidth = `${node.strokeWeight}rem`;
  }

  // Handle stroke style
  if (node.strokeDashes && node.strokeDashes.length > 0) {
    styles.borderStyle = 'dashed';
  } else if (node.strokes && node.strokes.length > 0) {
    styles.borderStyle = 'solid';
  }

  // Handle corner radius
  if (node.cornerRadius !== undefined && node.cornerRadius > 0) {
    styles.borderRadius = `${node.cornerRadius}rem`;
  }

  // Handle individual corner radii
  if (node.rectangleCornerRadii) {
    if (Array.isArray(node.rectangleCornerRadii)) {
      const [topLeft, topRight, bottomRight, bottomLeft] = node.rectangleCornerRadii;
      if (topLeft !== undefined) styles.borderTopLeftRadius = `${topLeft}rem`;
      if (topRight !== undefined) styles.borderTopRightRadius = `${topRight}rem`;
      if (bottomRight !== undefined) styles.borderBottomRightRadius = `${bottomRight}rem`;
      if (bottomLeft !== undefined) styles.borderBottomLeftRadius = `${bottomLeft}rem`;
    }
  }

  return styles;
}

/**
 * Convert Figma node properties to React Native padding styles
 */
export function figmaNodeToPaddingStyles(node: any) {
  const styles: any = {};

  if (node.paddingLeft !== undefined) {
    styles.paddingLeft = `${node.paddingLeft}rem`;
  }
  if (node.paddingRight !== undefined) {
    styles.paddingRight = `${node.paddingRight}rem`;
  }
  if (node.paddingTop !== undefined) {
    styles.paddingTop = `${node.paddingTop}rem`;
  }
  if (node.paddingBottom !== undefined) {
    styles.paddingBottom = `${node.paddingBottom}rem`;
  }

  return styles;
}

/**
 * Convert Figma node properties to React Native background styles
 */
export function figmaNodeToBackgroundStyles(node: any) {
  const styles: any = {};

  // Handle fills (background in RN)
  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0]; // Use first fill
    if (fill.type === 'SOLID' && fill.color) {
      styles.backgroundColor = figmaColorToRN(fill.color);
    }
  }

  // Handle background property
  if (!styles.backgroundColor && node.background && node.background.length > 0) {
    const bg = node.background[0];
    if (bg.type === 'SOLID' && bg.color) {
      styles.backgroundColor = figmaColorToRN(bg.color);
    }
  }

  // Handle backgroundColor property
  if (!styles.backgroundColor && node.backgroundColor) {
    styles.backgroundColor = figmaColorToRN(node.backgroundColor);
  }

  return styles;
}

/**
 * Convert complete Figma node to React Native styles
 */
export function figmaNodeToRNStyles(node: any) {
  return {
    ...figmaNodeToBackgroundStyles(node),
    ...figmaNodeToBorderStyles(node),
    ...figmaNodeToPaddingStyles(node),
  };
}

/**
 * Example usage for PaymentScreen container
 */
export function generatePaymentContainerStyles(figmaNode: any) {
  const baseStyles = figmaNodeToRNStyles(figmaNode);

  // Apply default padding if not present
  if (!baseStyles.paddingLeft) {
    baseStyles.padding = '16rem';
  }

  return baseStyles;
}