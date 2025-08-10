import { FigmaNode, ReactNativeComponentSpec, GenerationOptions, GenerationError, ReactNativeStyleProperties } from '../types';
import { ComponentParser } from '../parser/ComponentParser';
import { StyleParser } from '../parser/StyleParser';

/**
 * React Native component generator from Figma nodes
 */
export class ReactNativeGenerator {
  private options: GenerationOptions;
  private generatedStyles: Map<string, ReactNativeStyleProperties> = new Map();
  private componentCounter: number = 0;

  constructor(options: GenerationOptions) {
    this.options = {
      includeTypes: true,
      useStyleSheet: true,
      generateTests: false,
      formatCode: true,
      ...options
    };
  }

  /**
   * Generate complete React Native component from Figma node
   */
  public generateComponent(node: FigmaNode, componentName?: string): ReactNativeComponentSpec {
    try {
      this.generatedStyles.clear();
      this.componentCounter = 0;


      const finalComponentName = componentName || ComponentParser.generateComponentName(node.name);
      const analysis = ComponentParser.analyzeComponent(node);
      
      // Validate component
      const validation = ComponentParser.validateComponent(node);
      if (!validation.isValid) {
        throw new GenerationError(`Component validation failed: ${validation.errors.join(', ')}`, finalComponentName);
      }

      // Generate imports
      const imports = this.generateImports(analysis);

      // Generate TypeScript interfaces
      const interfaces = this.options.includeTypes ? 
        [ComponentParser.generatePropsInterface(finalComponentName, analysis)] : [];

      // Generate component JSX
      const componentJSX = this.generateComponentJSX(node, finalComponentName, analysis);

      // Generate styles
      const styles = this.generateStyles();

      // Generate exports
      const exports = [`export default ${finalComponentName};`];

      return {
        name: finalComponentName,
        imports,
        interfaces,
        component: componentJSX,
        styles,
        exports
      };
    } catch (error) {
      if (error instanceof GenerationError) {
        throw error;
      }
      throw new GenerationError(`Failed to generate component: ${error}`, componentName);
    }
  }

  /**
   * Generate imports section
   */
  private generateImports(analysis: ReturnType<typeof ComponentParser.analyzeComponent>): string[] {
    const imports = new Set<string>();
    
    // Basic React Native imports
    imports.add("import React from 'react';");
    
    const rnComponents = new Set(['View']);
    
    if (analysis.hasText) {
      rnComponents.add('Text');
    }
    
    if (this.options.useStyleSheet) {
      rnComponents.add('StyleSheet');
    }

    if (this.options.includeTypes) {
      rnComponents.add('ViewStyle');
      if (analysis.hasText) {
        rnComponents.add('TextStyle');
      }
    }

    imports.add(`import { ${Array.from(rnComponents).sort().join(', ')} } from 'react-native';`);

    return Array.from(imports);
  }

  /**
   * Generate main component JSX
   */
  private generateComponentJSX(
    node: FigmaNode, 
    componentName: string, 
    analysis: ReturnType<typeof ComponentParser.analyzeComponent>
  ): string {
    const propsType = this.options.includeTypes ? `: React.FC<${componentName}Props>` : '';
    const props = this.options.includeTypes ? `{ style, ...props }` : `props`;

    const componentBody = this.generateNodeJSX(node, 0, true);

    return `const ${componentName}${propsType} = (${props}) => {\n` +
           `  return (\n${componentBody}\n  );\n` +
           `};`;
  }

  /**
   * Generate JSX for a single node
   */
  private generateNodeJSX(node: FigmaNode, depth: number = 0, isRoot: boolean = false): string {
    const indent = '    '.repeat(depth + 1);
    
    if (!ComponentParser.shouldRenderNode(node)) {
      return '';
    }

    const componentType = ComponentParser.getComponentType(node);
    const styleName = this.generateStyleForNode(node, isRoot);
    
    // Handle text nodes specially
    if (node.type === 'TEXT') {
      const textContent = ComponentParser.extractTextContent(node);
      const styleReference = this.options.useStyleSheet ? `styles.${styleName}` : `{${JSON.stringify(this.generatedStyles.get(styleName))}}`;
      
      return `${indent}<Text style={${styleReference}}>\n` +
             `${indent}  {${JSON.stringify(textContent)}}\n` +
             `${indent}</Text>`;
    }

    // Handle nodes that should render as images
    if (ComponentParser.shouldRenderAsImage(node)) {
      // For now, render as View with a comment
      const styleReference = this.options.useStyleSheet ? `styles.${styleName}` : `{${JSON.stringify(this.generatedStyles.get(styleName))}}`;
      return `${indent}<View style={${styleReference}}>\n` +
             `${indent}  {/* TODO: Replace with Image component for vector graphics */}\n` +
             `${indent}</View>`;
    }

    // Generate children
    const childrenJSX = this.generateChildrenJSX(node, depth + 1);
    
    const styleReference = isRoot && this.options.includeTypes ?
      `[${this.options.useStyleSheet ? `styles.${styleName}` : `{${JSON.stringify(this.generatedStyles.get(styleName))}}`}, style]` :
      (this.options.useStyleSheet ? `styles.${styleName}` : `{${JSON.stringify(this.generatedStyles.get(styleName))}}`);

    if (childrenJSX.trim()) {
      return `${indent}<${componentType} style={${styleReference}}>\n` +
             `${childrenJSX}\n` +
             `${indent}</${componentType}>`;
    } else {
      return `${indent}<${componentType} style={${styleReference}} />`;
    }
  }

  /**
   * Generate JSX for node children
   */
  private generateChildrenJSX(node: FigmaNode, depth: number): string {
    if (!node.children || node.children.length === 0) {
      return '';
    }

    const childrenJSX = node.children
      .filter(child => ComponentParser.shouldRenderNode(child))
      .map(child => this.generateNodeJSX(child, depth))
      .filter(jsx => jsx.trim() !== '')
      .join('\n');

    return childrenJSX;
  }

  /**
   * Generate and store style for a node
   */
  private generateStyleForNode(node: FigmaNode, isRoot: boolean = false): string {
    const baseStyleName = isRoot ? 'container' : ComponentParser.generateStyleName(node.name);
    let styleName = baseStyleName;
    
    // Ensure unique style names
    let counter = 1;
    while (this.generatedStyles.has(styleName)) {
      styleName = `${baseStyleName}${counter}`;
      counter++;
    }

    // Generate style properties
    let styleProps = StyleParser.nodeToStyles(node);
    
    // Apply layout-specific optimizations
    if (isRoot) {
      // Root container styling
      styleProps = {
        ...styleProps,
        alignSelf: 'stretch'
      };
      
      // Remove absolute positioning for root
      delete styleProps.left;
      delete styleProps.top;
    } else if (node.layoutMode) {
      // Flex layout
      delete styleProps.left;
      delete styleProps.top;
    }

    // Handle spacing for auto-layout
    if (node.layoutMode && (styleProps as any).itemSpacing) {
      const spacing = (styleProps as any).itemSpacing;
      delete (styleProps as any).itemSpacing;
      
      // Add margin to simulate spacing (this is a simplified approach)
      if (node.layoutMode === 'HORIZONTAL') {
        styleProps.marginRight = spacing;
      } else {
        styleProps.marginBottom = spacing;
      }
    }

    // Optimize styles
    styleProps = StyleParser.optimizeStyles(styleProps);

    this.generatedStyles.set(styleName, styleProps);
    return styleName;
  }

  /**
   * Generate styles section
   */
  private generateStyles(): string {
    if (this.generatedStyles.size === 0) {
      return '';
    }

    if (!this.options.useStyleSheet) {
      return ''; // Styles are inlined
    }

    const styleEntries = Array.from(this.generatedStyles.entries())
      .map(([name, styles]) => {
        const stylesString = StyleParser.stylesToString(styles, 2);
        return `  ${name}: ${stylesString}`;
      })
      .join(',\n');

    return `const styles = StyleSheet.create({\n${styleEntries}\n});`;
  }

  /**
   * Generate complete file content
   */
  public generateFileContent(componentSpec: ReactNativeComponentSpec): string {
    const sections = [
      componentSpec.imports.join('\n'),
      '',
      ...(componentSpec.interfaces.length > 0 ? [componentSpec.interfaces.join('\n\n'), ''] : []),
      componentSpec.component,
      '',
      ...(componentSpec.styles ? [componentSpec.styles, ''] : []),
      componentSpec.exports.join('\n')
    ];

    let content = sections.filter(section => section !== '').join('\n');

    // Format code if requested
    if (this.options.formatCode) {
      content = this.formatCode(content);
    }

    return content;
  }

  /**
   * Simple code formatting
   */
  private formatCode(code: string): string {
    // Basic formatting rules
    return code
      .replace(/\n\n\n+/g, '\n\n') // Remove multiple empty lines
      .replace(/^\s*\n/gm, '\n')   // Remove empty lines with spaces
      .trim() + '\n';              // Ensure file ends with newline
  }

  /**
   * Generate test file content
   */
  public generateTestFile(componentSpec: ReactNativeComponentSpec): string {
    if (!this.options.generateTests) {
      return '';
    }

    return `import React from 'react';\n` +
           `import { render } from '@testing-library/react-native';\n` +
           `import ${componentSpec.name} from './${componentSpec.name}';\n\n` +
           `describe('${componentSpec.name}', () => {\n` +
           `  it('renders correctly', () => {\n` +
           `    const { toJSON } = render(<${componentSpec.name} />);\n` +
           `    expect(toJSON()).toMatchSnapshot();\n` +
           `  });\n` +
           `});\n`;
  }

  /**
   * Get generation statistics
   */
  public getStats(): {
    stylesGenerated: number;
    componentsGenerated: number;
    linesOfCode: number;
  } {
    return {
      stylesGenerated: this.generatedStyles.size,
      componentsGenerated: this.componentCounter,
      linesOfCode: 0 // This would need to be calculated during generation
    };
  }
}