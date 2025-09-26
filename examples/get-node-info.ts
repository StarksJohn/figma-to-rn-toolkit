/**
 * Example: How to use getFigmaNodeInfo function
 * This demonstrates how other RN projects can easily fetch Figma node information
 */

import { getFigmaNodeInfo, parseFigmaUrl } from 'figma-to-rn-toolkit';
// Or if using CommonJS:
// const { getFigmaNodeInfo, parseFigmaUrl } = require('figma-to-rn-toolkit');

async function exampleUsage() {
  // Your Figma Personal Access Token
  // Get it from: https://www.figma.com/settings/account#personal-access-tokens
  const FIGMA_TOKEN = 'YOUR_FIGMA_TOKEN';

  // The Figma URL (obtained from "Copy link to selection" in Figma)
  // Example URL format: https://www.figma.com/design/ABC123/MyDesign?node-id=2%3A4
  const FIGMA_URL = 'https://www.figma.com/design/YOUR_FILE_ID/YOUR_FILE_NAME?node-id=YOUR_NODE_ID';

  try {
    console.log('Fetching Figma node information...');

    // Fetch the node information
    const nodeInfo = await getFigmaNodeInfo(FIGMA_TOKEN, FIGMA_URL);

    // Display the results
    console.log('\n=== Figma Node Information ===');
    console.log('Name:', nodeInfo.name);
    console.log('Type:', nodeInfo.type);
    console.log('ID:', nodeInfo.id);

    // Check if the node has dimensions
    if (nodeInfo.absoluteBoundingBox) {
      console.log('\n=== Dimensions ===');
      console.log('Width:', nodeInfo.absoluteBoundingBox.width);
      console.log('Height:', nodeInfo.absoluteBoundingBox.height);
      console.log('X Position:', nodeInfo.absoluteBoundingBox.x);
      console.log('Y Position:', nodeInfo.absoluteBoundingBox.y);
    }

    // Check if the node has fills (colors/gradients)
    if (nodeInfo.fills && nodeInfo.fills.length > 0) {
      console.log('\n=== Fills ===');
      nodeInfo.fills.forEach((fill: any, index: number) => {
        console.log(`Fill ${index + 1}:`, fill.type);
        if (fill.color) {
          const rgb = `rgb(${Math.round(fill.color.r * 255)}, ${Math.round(fill.color.g * 255)}, ${Math.round(fill.color.b * 255)})`;
          console.log('  Color:', rgb);
          console.log('  Opacity:', fill.color.a);
        }
      });
    }

    // Check if the node has strokes (borders)
    if (nodeInfo.strokes && nodeInfo.strokes.length > 0) {
      console.log('\n=== Strokes ===');
      console.log('Stroke Weight:', nodeInfo.strokeWeight);
      console.log('Stroke Align:', nodeInfo.strokeAlign);
      nodeInfo.strokes.forEach((stroke: any, index: number) => {
        console.log(`Stroke ${index + 1}:`, stroke.type);
        if (stroke.color) {
          const rgb = `rgb(${Math.round(stroke.color.r * 255)}, ${Math.round(stroke.color.g * 255)}, ${Math.round(stroke.color.b * 255)})`;
          console.log('  Color:', rgb);
        }
      });
    }

    // Check if the node has effects (shadows, blurs, etc.)
    if (nodeInfo.effects && nodeInfo.effects.length > 0) {
      console.log('\n=== Effects ===');
      nodeInfo.effects.forEach((effect: any, index: number) => {
        console.log(`Effect ${index + 1}:`, effect.type);
        if (effect.type === 'DROP_SHADOW') {
          console.log('  Offset:', `${effect.offset.x}, ${effect.offset.y}`);
          console.log('  Radius:', effect.radius);
        }
      });
    }

    // Check if the node has children
    if (nodeInfo.children && nodeInfo.children.length > 0) {
      console.log('\n=== Children ===');
      console.log('Number of children:', nodeInfo.children.length);
      nodeInfo.children.forEach((child: any, index: number) => {
        console.log(`  ${index + 1}. ${child.name} (${child.type})`);
      });
    }

    // Check layout properties for auto-layout frames
    if (nodeInfo.layoutMode) {
      console.log('\n=== Auto Layout ===');
      console.log('Layout Mode:', nodeInfo.layoutMode);
      console.log('Item Spacing:', nodeInfo.itemSpacing);
      console.log('Padding:', {
        top: nodeInfo.paddingTop,
        right: nodeInfo.paddingRight,
        bottom: nodeInfo.paddingBottom,
        left: nodeInfo.paddingLeft
      });
    }

    // Display the full node data as JSON
    console.log('\n=== Full Node Data (JSON) ===');
    console.log(JSON.stringify(nodeInfo, null, 2));

  } catch (error) {
    console.error('Error fetching node information:', error);
  }
}

// Advanced example: Parse URL separately
async function advancedExample() {
  const FIGMA_TOKEN = 'YOUR_FIGMA_TOKEN';
  const FIGMA_URL = 'https://www.figma.com/design/ABC123/MyDesign?node-id=2%3A4';

  try {
    // Parse the URL first
    const { fileId, nodeId } = parseFigmaUrl(FIGMA_URL);
    console.log('File ID:', fileId);
    console.log('Node ID:', nodeId);

    // Then fetch the node info
    const nodeInfo = await getFigmaNodeInfo(FIGMA_TOKEN, FIGMA_URL);
    console.log('Node Name:', nodeInfo.name);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Example: Using in a React Native component
function ReactNativeExample() {
  // This would be in your React Native component
  /*
  import React, { useEffect, useState } from 'react';
  import { View, Text, ActivityIndicator } from 'react-native';
  import { getFigmaNodeInfo } from 'figma-to-rn-toolkit';

  export function FigmaNodeViewer({ token, url }) {
    const [nodeInfo, setNodeInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      async function loadNodeInfo() {
        try {
          setLoading(true);
          const info = await getFigmaNodeInfo(token, url);
          setNodeInfo(info);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }

      loadNodeInfo();
    }, [token, url]);

    if (loading) {
      return <ActivityIndicator />;
    }

    if (error) {
      return <Text>Error: {error}</Text>;
    }

    return (
      <View>
        <Text>Node Name: {nodeInfo?.name}</Text>
        <Text>Node Type: {nodeInfo?.type}</Text>
        <Text>Width: {nodeInfo?.absoluteBoundingBox?.width}</Text>
        <Text>Height: {nodeInfo?.absoluteBoundingBox?.height}</Text>
      </View>
    );
  }
  */
}

// Run the example
if (require.main === module) {
  console.log('Running Figma Node Info Example...');
  console.log('Make sure to replace YOUR_FIGMA_TOKEN and FIGMA_URL with actual values.\n');

  // Uncomment to run:
  // exampleUsage();
}