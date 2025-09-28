# Style Conversion Utilities

The `figma-to-rn-toolkit` now includes comprehensive style conversion utilities to help you accurately transform Figma designs into React Native styles.

## Installation

```bash
npm install figma-to-rn-toolkit@latest
```

## Usage

### Basic Example

```typescript
import {
  getFigmaNodeInfo,
  figmaNodeToRNStyles
} from 'figma-to-rn-toolkit';

// Fetch Figma node data
const token = 'YOUR_FIGMA_TOKEN';
const url = 'YOUR_FIGMA_URL';
const nodeInfo = await getFigmaNodeInfo(token, url);

// Convert to React Native styles
const rnStyles = figmaNodeToRNStyles(nodeInfo);
console.log(rnStyles);
// Output: { backgroundColor: '#FFFFFF', borderWidth: '1rem', ... }
```

## Available Functions

### `figmaColorToRN(color: FigmaColor): string`

Converts Figma color objects to React Native color strings.

```typescript
const color = { r: 1, g: 1, b: 1, a: 1 };
const rnColor = figmaColorToRN(color);
// Output: 'rgb(255, 255, 255)'
```

### `figmaNodeToBorderStyles(node: any)`

Extracts and converts all border-related styles from a Figma node.

- Handles strokes (borders)
- Stroke weight (border width)
- Stroke style (solid/dashed)
- Corner radius (all corners or individual)

```typescript
const borderStyles = figmaNodeToBorderStyles(figmaNode);
// Output: { borderWidth: '1rem', borderColor: 'rgba(221, 221, 221, 1)', ... }
```

### `figmaNodeToPaddingStyles(node: any)`

Extracts padding information from a Figma node.

```typescript
const paddingStyles = figmaNodeToPaddingStyles(figmaNode);
// Output: { paddingLeft: '16rem', paddingRight: '16rem', ... }
```

### `figmaNodeToBackgroundStyles(node: any)`

Extracts background color from fills, background, or backgroundColor properties.

```typescript
const bgStyles = figmaNodeToBackgroundStyles(figmaNode);
// Output: { backgroundColor: '#FFFFFF' }
```

### `figmaNodeToRNStyles(node: any)`

Complete conversion function that combines all style extractors.

```typescript
const styles = figmaNodeToRNStyles(figmaNode);
// Output: Complete style object with background, borders, and padding
```

### `generatePaymentContainerStyles(figmaNode: any)`

Example function showing how to create custom style generators with defaults.

```typescript
const containerStyles = generatePaymentContainerStyles(figmaNode);
// Includes all styles plus default padding if not present
```

## Integration with React Native

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getFigmaNodeInfo, figmaNodeToRNStyles } from 'figma-to-rn-toolkit';
import EStyleSheet from 'react-native-extended-stylesheet';

// Fetch and convert styles
const figmaNode = await getFigmaNodeInfo(token, url);
const dynamicStyles = figmaNodeToRNStyles(figmaNode);

// Create stylesheet
const styles = EStyleSheet.create({
  container: {
    ...dynamicStyles,
    // Add any additional custom styles
  }
});

// Use in component
const MyComponent = () => {
  return (
    <View style={styles.container}>
      <Text>Content</Text>
    </View>
  );
};
```

## Supported Style Properties

### Border Styles
- `borderWidth` - Stroke weight from Figma
- `borderColor` - First stroke color
- `borderStyle` - 'solid' or 'dashed'
- `borderRadius` - Corner radius (all corners)
- `borderTopLeftRadius` - Individual corner
- `borderTopRightRadius` - Individual corner
- `borderBottomLeftRadius` - Individual corner
- `borderBottomRightRadius` - Individual corner

### Padding Styles
- `paddingLeft`
- `paddingRight`
- `paddingTop`
- `paddingBottom`

### Background Styles
- `backgroundColor` - From fills, background, or backgroundColor

## Notes

- All numeric values are returned with 'rem' units for responsive design
- Colors are converted to RGB/RGBA format
- First fill/stroke is used when multiple are present
- Bound variables are resolved to their actual values

## Contributing

Found a bug or want to add more style conversions? Feel free to open an issue or submit a PR at [GitHub](https://github.com/figma-to-rn-toolkit/figma-to-rn-toolkit).