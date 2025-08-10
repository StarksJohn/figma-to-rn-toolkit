// Figma API Types
export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  children?: FigmaNode[];
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  style?: FigmaTextStyle;
  cornerRadius?: number;
  characters?: string;
  componentId?: string;
  effects?: FigmaEffect[];
  visible?: boolean;
  locked?: boolean;
  opacity?: number;
  blendMode?: string;
  constraints?: FigmaConstraints;
  layoutMode?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  counterAxisSizingMode?: string;
  primaryAxisSizingMode?: string;
  counterAxisAlignItems?: string;
  primaryAxisAlignItems?: string;
}

export interface FigmaFill {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE';
  color?: FigmaColor;
  opacity?: number;
  visible?: boolean;
  gradientHandlePositions?: FigmaVector[];
  gradientStops?: FigmaColorStop[];
  scaleMode?: string;
  imageTransform?: number[][];
  scalingFactor?: number;
  imageRef?: string;
}

export interface FigmaStroke {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND';
  color?: FigmaColor;
  opacity?: number;
  visible?: boolean;
}

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface FigmaVector {
  x: number;
  y: number;
}

export interface FigmaColorStop {
  position: number;
  color: FigmaColor;
}

export interface FigmaTextStyle {
  fontFamily: string;
  fontPostScriptName?: string;
  fontSize: number;
  fontWeight: number;
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM';
  letterSpacing?: number;
  lineHeightPx?: number;
  lineHeightPercent?: number;
  lineHeightPercentFontSize?: number;
  lineHeightUnit?: 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%';
  textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
  textCase?: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';
}

export interface FigmaEffect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  visible?: boolean;
  radius?: number;
  color?: FigmaColor;
  blendMode?: string;
  offset?: FigmaVector;
  spread?: number;
}

export interface FigmaConstraints {
  vertical: 'TOP' | 'BOTTOM' | 'CENTER' | 'TOP_BOTTOM' | 'SCALE';
  horizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'LEFT_RIGHT' | 'SCALE';
}

export interface FigmaFile {
  name: string;
  document: FigmaNode;
  components: Record<string, FigmaComponent>;
  componentSets: Record<string, FigmaComponentSet>;
  styles: Record<string, FigmaStyle>;
  schemaVersion: number;
  version: string;
  role: string;
  editorType: string;
  linkAccess: string;
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  componentSetId?: string;
  documentationLinks: any[];
  remote: boolean;
}

export interface FigmaComponentSet {
  key: string;
  name: string;
  description: string;
  documentationLinks: any[];
  remote: boolean;
}

export interface FigmaStyle {
  key: string;
  name: string;
  description: string;
  remote: boolean;
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
}

// React Native Generation Types
export interface ReactNativeComponentSpec {
  name: string;
  imports: string[];
  interfaces: string[];
  component: string;
  styles: string;
  exports: string[];
}

export interface ReactNativeStyleProperties {
  position?: 'absolute' | 'relative';
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  width?: number | string;
  height?: number | string;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dotted' | 'dashed';
  padding?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  margin?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  flex?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | string;
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  color?: string;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
  lineHeight?: number;
  letterSpacing?: number;
  textDecorationLine?: 'none' | 'underline' | 'line-through' | 'underline line-through';
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  opacity?: number;
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
  overflow?: 'visible' | 'hidden' | 'scroll';
  zIndex?: number;
}

export interface GenerationOptions {
  outputPath: string;
  componentName?: string;
  includeTypes?: boolean;
  useStyleSheet?: boolean;
  generateTests?: boolean;
  formatCode?: boolean;
}

export interface FigmaUrlInfo {
  fileKey: string;
  nodeId?: string;
  version?: string;
}

// CLI Types
export interface CliOptions {
  token: string;
  url: string;
  output: string;
  name?: string;
  format?: 'typescript' | 'javascript';
  stylesheet?: boolean;
  tests?: boolean;
}

// Error Types
export class FigmaAPIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'FigmaAPIError';
  }
}

export class ParseError extends Error {
  constructor(message: string, public nodeId?: string) {
    super(message);
    this.name = 'ParseError';
  }
}

export class GenerationError extends Error {
  constructor(message: string, public componentName?: string) {
    super(message);
    this.name = 'GenerationError';
  }
}