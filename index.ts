/**
 * Figma to React Native conversion tools
 * Main entry point for the library
 */

// API Classes
export { FigmaAPI } from './src/api/FigmaAPI';

// MCP Classes (Model Context Protocol)
export { FigmaMCPClient } from './src/mcp/FigmaMCPClient';
export { FigmaMCPIntegration } from './src/mcp/FigmaMCPIntegration';

// Parser Classes
export { ComponentParser } from './src/parser/ComponentParser';
export { StyleParser } from './src/parser/StyleParser';

// Generator Classes
export { ReactNativeGenerator } from './src/generator/ReactNativeGenerator';

// Utility Classes
export { FigmaUtils } from './src/utils/figmaUtils';
export { StringUtils } from './src/utils/stringUtils';

// Types
export * from './src/types';

// Main Converter Class
import { FigmaAPI } from './src/api/FigmaAPI';
import { ReactNativeGenerator } from './src/generator/ReactNativeGenerator';
import { FigmaNode, GenerationOptions, ReactNativeComponentSpec, FigmaAPIError, GenerationError } from './src/types';
import { FigmaUtils } from './src/utils/figmaUtils';
import { ComponentParser } from './src/parser/ComponentParser';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Main class for converting Figma designs to React Native components
 */
export class FigmaToReactNative {
  private figmaAPI: FigmaAPI;
  private generator: ReactNativeGenerator;

  constructor(token: string, options?: Partial<GenerationOptions>) {
    this.figmaAPI = new FigmaAPI(token);
    this.generator = new ReactNativeGenerator({
      outputPath: options?.outputPath || './components',
      includeTypes: true,
      useStyleSheet: true,
      generateTests: false,
      formatCode: true,
      ...options
    });
  }

  /**
   * Generate React Native component from Figma URL
   */
  public async generateComponentFromUrl(
    figmaUrl: string, 
    options?: {
      componentName?: string;
      outputPath?: string;
      writeToFile?: boolean;
    }
  ): Promise<ReactNativeComponentSpec> {
    try {
      console.log(`Starting conversion from Figma URL: ${figmaUrl}`);
      
      
      // Validate URL
      if (!FigmaUtils.isValidFigmaUrl(figmaUrl)) {
        throw new FigmaAPIError('Invalid Figma URL format');
      }

      // Get component from Figma
      const node = await this.figmaAPI.getComponentFromUrl(figmaUrl);
      console.log(`Retrieved Figma component: ${node.name}`);

      // Validate component
      const validation = ComponentParser.validateComponent(node);
      if (validation.warnings.length > 0) {
        console.warn('Component validation warnings:', validation.warnings);
      }
      if (!validation.isValid) {
        throw new GenerationError(`Component validation failed: ${validation.errors?.join(', ')}`);
      }

      // Generate component
      const componentSpec = this.generator.generateComponent(node, options?.componentName);
      console.log(`Generated React Native component: ${componentSpec.name}`);

      // Write to file if requested
      if (options?.writeToFile !== false) {
        await this.writeComponentToFile(componentSpec, options?.outputPath);
      }

      return componentSpec;
    } catch (error) {
      if (error instanceof FigmaAPIError || error instanceof GenerationError) {
        throw error;
      }
      throw new Error(`Failed to generate component: ${error}`);
    }
  }

  /**
   * Generate React Native component from file key and node ID
   */
  public async generateComponent(
    fileKey: string,
    nodeId?: string,
    options?: {
      componentName?: string;
      outputPath?: string;
      writeToFile?: boolean;
    }
  ): Promise<ReactNativeComponentSpec> {
    const url = FigmaUtils.generateUrl(fileKey, nodeId);
    return this.generateComponentFromUrl(url, options);
  }

  /**
   * Write component to file system
   */
  public async writeComponentToFile(
    componentSpec: ReactNativeComponentSpec,
    outputPath?: string
  ): Promise<string> {
    let basePath = outputPath || this.generator['options'].outputPath;
    
    // Handle special case for relative paths that might conflict with directory names
    if (basePath && !path.isAbsolute(basePath)) {
      // 🔧 FIX: 尊重用户指定的输出路径，不再强制修改
      // 只有当用户没有明确指定路径时才使用默认的components目录
      if (!basePath || basePath === '.') {
        basePath = 'components';
        console.log(`📁 Using default output path: ${basePath}`);
      } else {
        // 用户明确指定了路径，直接使用
        console.log(`📁 Using user-specified output path: ${basePath}`);
      }
    }
    
    const fileName = `${componentSpec.name}.tsx`;
    const filePath = path.join(basePath, fileName);
    const absolutePath = path.resolve(filePath);

    // Ensure output directory exists
    await this.ensureDirectoryExists(path.dirname(absolutePath));

    // Generate complete file content
    const fileContent = this.generator.generateFileContent(componentSpec);

    // Write to file
    await fs.promises.writeFile(absolutePath, fileContent, 'utf8');
    console.log(`📝 Component written to: ${absolutePath}`);

    // Generate test file if enabled
    if (this.generator['options'].generateTests) {
      const testContent = this.generator.generateTestFile(componentSpec);
      const testPath = path.join(path.dirname(absolutePath), `${componentSpec.name}.test.tsx`);
      await fs.promises.writeFile(testPath, testContent, 'utf8');
      console.log(`🧪 Test file written to: ${testPath}`);
    }

    return absolutePath;
  }

  /**
   * Batch generate components from multiple URLs
   */
  public async generateMultipleComponents(
    urls: string[],
    options?: {
      outputPath?: string;
      writeToFile?: boolean;
      concurrency?: number;
    }
  ): Promise<ReactNativeComponentSpec[]> {
    const concurrency = options?.concurrency || 3;
    const results: ReactNativeComponentSpec[] = [];

    // Process in batches to avoid rate limiting
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchPromises = batch.map(url => 
        this.generateComponentFromUrl(url, {
          outputPath: options?.outputPath,
          writeToFile: options?.writeToFile
        }).catch(error => {
          console.error(`Failed to generate component from ${url}:`, error.message);
          return null;
        })
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null) as ReactNativeComponentSpec[]);

      // Add delay between batches to respect rate limits
      if (i + concurrency < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Get component preview information without generating full code
   */
  public async getComponentPreview(figmaUrl: string): Promise<{
    name: string;
    analysis: ReturnType<typeof ComponentParser.analyzeComponent>;
    validation: ReturnType<typeof ComponentParser.validateComponent>;
    colors: string[];
    fonts: Array<{fontFamily: string, fontSize: number, fontWeight: number}>;
  }> {
    const node = await this.figmaAPI.getComponentFromUrl(figmaUrl);
    
    return {
      name: node.name,
      analysis: ComponentParser.analyzeComponent(node),
      validation: ComponentParser.validateComponent(node),
      colors: ComponentParser.extractColors(node),
      fonts: ComponentParser.extractFonts(node)
    };
  }

  /**
   * Validate Figma token
   */
  public async validateToken(): Promise<boolean> {
    return this.figmaAPI.validateToken();
  }

  /**
   * Get generation statistics
   */
  public getStats() {
    return this.generator.getStats();
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.promises.access(dirPath);
    } catch {
      await fs.promises.mkdir(dirPath, { recursive: true });
    }
  }
}

// Export default instance creator
export const createConverter = (token: string, options?: Partial<GenerationOptions>) => {
  return new FigmaToReactNative(token, options);
};