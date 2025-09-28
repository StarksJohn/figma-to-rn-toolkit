/**
 * Figma to React Native Toolkit
 * A comprehensive toolkit for converting Figma designs to React Native components
 */

// Export Figma API functions
export {
  getFigmaNodeInfo,
  getFigmaNodesInfo,
  parseFigmaUrl,
  type FigmaNodeInfo
} from './api/FigmaNodeFetcher';

// Export style conversion utilities
export {
  figmaColorToRN,
  figmaNodeToBorderStyles,
  figmaNodeToPaddingStyles,
  figmaNodeToBackgroundStyles,
  figmaNodeToRNStyles,
  generatePaymentContainerStyles
} from './utils/figmaToRNStyles';