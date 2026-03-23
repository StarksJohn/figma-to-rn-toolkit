# Figma to React Native Toolkit

<div align="center">

**🌍 Languages / 语言选择:** [English](README.md) | [中文](README_zh.md)

---

🎨 **A comprehensive toolkit for automatically converting Figma designs to React Native components**

[![NPM Version](https://img.shields.io/npm/v/figma-to-rn-toolkit.svg)](https://www.npmjs.com/package/figma-to-rn-toolkit)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-Compatible-green.svg)](https://reactnative.dev/)

[GitHub](https://github.com/figma-to-rn-toolkit/figma-to-rn-toolkit) | [NPM](https://www.npmjs.com/package/figma-to-rn-toolkit) | [Issues](https://github.com/figma-to-rn-toolkit/figma-to-rn-toolkit/issues)

</div>

## 🚀 Introduction

Figma to React Native Toolkit is a powerful open-source toolkit designed specifically for automatically converting Figma designs into high-quality React Native components. It supports the latest MCP (Model Context Protocol) real-time access, making design-to-code conversion more efficient and accurate.

### ✨ Key Features

- 🎨 **Smart Design Parsing** - Automatically analyze Figma design structure and styles
- 📱 **React Native Code Generation** - Generate ready-to-use TypeScript components
- 🔄 **Real-time MCP Support** - Real-time Figma access through Model Context Protocol
- 🎯 **Precise Style Conversion** - Perfect conversion from Figma styles to React Native StyleSheet
- 📋 **TypeScript Support** - Complete type definitions and code completion
- 🛠️ **CLI Tools** - Powerful command-line interface with batch processing support
- 🔧 **Extensible Architecture** - Modular design, easy to customize and extend
- 🌍 **Cross-platform Compatibility** - Supports Windows, macOS, and Linux

## 📦 Installation

### NPM Installation
```bash
npm install -g figma-to-rn-toolkit
```

### Yarn Installation
```bash
yarn global add figma-to-rn-toolkit
```

### Development Dependency Installation
```bash
npm install --save-dev figma-to-rn-toolkit
```

## 🏗️ System Requirements

- **Node.js**: >=16.0.0
- **NPM**: >=8.0.0
- **React Native**: >=0.65.0 (peerDependency)
- **TypeScript**: >=4.0.0 (recommended)

## 🎯 Quick Start

### 1. Get Figma Access Token

Go to [Figma Settings > Personal Access Tokens](https://www.figma.com/settings/tokens) to create a new access token:

**Required Permission Settings:**
- ✅ **File content** → Read
- ✅ **Current user** → Read  
- ✅ **File metadata** → Read

### 2. Configure Environment Variables

Create a `.env` file in your project root directory:

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file and add your Figma token
FIGMA_TOKEN=your_figma_personal_access_token_here
```

**Security Note:** Never commit your `.env` file to version control. The `.env` file is already included in `.gitignore` to prevent accidental commits of sensitive information.

### 3. Basic Usage

#### Command Line Method (Recommended)
```bash
# Generate single component (token from environment variable)
figma-to-rn generate \
  --token="$FIGMA_TOKEN" \
  --url="https://www.figma.com/design/YOUR_FILE_ID/Design?node-id=NODE_ID" \
  --output="./components" \
  --name="CustomButton"

# Or explicitly provide token
figma-to-rn generate \
  --token="YOUR_FIGMA_TOKEN" \
  --url="https://www.figma.com/design/YOUR_FILE_ID/Design?node-id=NODE_ID" \
  --output="./components" \
  --name="CustomButton"

# Preview component information
figma-to-rn preview \
  --token="$FIGMA_TOKEN" \
  --url="YOUR_FIGMA_URL"

# Batch generate components
figma-to-rn batch \
  --token="$FIGMA_TOKEN" \
  --file="./urls.txt" \
  --output="./components"
```

#### Programmatic Usage
```typescript
import { FigmaToReactNative } from 'figma-to-rn-toolkit';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const converter = new FigmaToReactNative(process.env.FIGMA_TOKEN || '', {
  outputPath: './components',
  includeTypes: true,
  useStyleSheet: true
});

const component = await converter.generateComponentFromUrl(
  'https://www.figma.com/design/FILE_ID/Design?node-id=NODE_ID',
  {
    componentName: 'MyComponent',
    writeToFile: true
  }
);
```

#### Node.js Script Method
For quick testing or to avoid command-line argument issues in Windows environments, you can use the included direct execution script:

**Option 1: Use included script directly**
```bash
node direct-run.js
```

**Option 2: Modify the script for your needs**
Edit `direct-run.js` and update the configuration:
```javascript
const config = {
  token: "YOUR_FIGMA_TOKEN",
  url: "https://www.figma.com/design/YOUR_FILE_ID/Design?node-id=YOUR_NODE_ID",
  output: "components",
  name: "YourComponentName"
};
```

**Option 3: Create your own script**
```javascript
// Create your-script.js
const { FigmaToReactNative } = require('figma-to-rn-toolkit');

async function generateComponent() {
  try {
    const converter = new FigmaToReactNative('YOUR_FIGMA_TOKEN', {
      outputPath: './components'
    });

    const component = await converter.generateComponentFromUrl(
      'https://www.figma.com/design/YOUR_FILE_ID/Design?node-id=YOUR_NODE_ID',
      {
        componentName: 'CustomButton',
        writeToFile: true
      }
    );

    console.log(`✅ Component ${component.name} generated successfully!`);
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
  }
}

generateComponent();
```

### 3. MCP Real-time Access (Advanced Feature)

```bash
# Check MCP server status
figma-mcp status

# Connect to Figma MCP
figma-mcp connect

# Generate component from current selection
figma-mcp generate-selection

# Interactive mode
figma-mcp interactive
```

## 📋 Feature Details

### Supported Figma Features

| Feature | Support Status | Description |
|---------|---------------|-------------|
| Basic Shapes | ✅ Full Support | Rectangles, circles, lines, etc. |
| Text Styles | ✅ Full Support | Font, size, color, alignment |
| Auto Layout | ✅ Full Support | Convert to Flexbox layout |
| Color Fills | ✅ Full Support | Solid colors, gradients |
| Stroke Styles | ✅ Full Support | Border styles and colors |
| Border Radius | ✅ Full Support | Uniform and individual corner radius |
| Shadow Effects | ✅ Full Support | Drop Shadow and Inner Shadow |
| Opacity | ✅ Full Support | Element transparency |
| Component Instances | 🔄 Partial Support | Basic instance conversion |
| Boolean Operations | 🔄 Partial Support | Convert to image assets |
| Complex Paths | 🔄 Partial Support | Convert to SVG components |
| Animations | ❌ Not Supported | Planned for future versions |

### Generated Code Structure

The tool generates React Native components similar to the following structure:

```typescript
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface CustomButtonProps {
  title?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>
        {title || "Button"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 44,
    backgroundColor: 'rgb(0, 122, 255)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600',
    color: 'rgb(255, 255, 255)'
  }
});

export default CustomButton;
```

## 🛠️ CLI Command Reference

### generate Command
Generate React Native components

```bash
figma-to-rn generate [options]
```

**Options:**
- `-t, --token <token>` - Figma access token (required)
- `-u, --url <url>` - Figma component URL (required)
- `-o, --output <path>` - Output directory (default: ./components)
- `-n, --name <name>` - Custom component name
- `--no-typescript` - Generate JavaScript code
- `--no-stylesheet` - Use inline styles
- `--tests` - Generate test files
- `--no-format` - Skip code formatting

### preview Command
Preview component information without generating code

```bash
figma-to-rn preview --token="TOKEN" --url="URL"
```

### batch Command
Batch process multiple components

```bash
figma-to-rn batch --token="TOKEN" --file="urls.txt" --output="./components"
```

### validate Command
Validate token and URL format

```bash
figma-to-rn validate --token="TOKEN" --url="URL"
```

## 🔧 Configuration Options

### GenerationOptions Interface

```typescript
interface GenerationOptions {
  outputPath: string;           // Output path
  componentName?: string;       // Component name
  includeTypes?: boolean;       // Generate TypeScript types
  useStyleSheet?: boolean;      // Use StyleSheet
  generateTests?: boolean;      // Generate test files
  formatCode?: boolean;         // Code formatting
}
```

## 📚 API Reference

### Main Classes

#### FigmaToReactNative
Main converter class

```typescript
class FigmaToReactNative {
  constructor(token: string, options?: FigmaOptions);
  
  async generateComponentFromUrl(
    url: string, 
    options?: GenerationOptions
  ): Promise<ComponentSpec>;
  
  async validateToken(): Promise<boolean>;
  async getFileInfo(fileKey: string): Promise<FigmaFile>;
}
```

#### FigmaMCPIntegration
MCP integration class

```typescript
class FigmaMCPIntegration {
  constructor(options: MCPOptions);
  
  async connect(): Promise<void>;
  async generateFromSelection(options: GenerationOptions): Promise<ComponentSpec>;
  async getContext(): Promise<MCPContext>;
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Token Permission Error (403 Forbidden)
**Cause:** Incorrect permission settings  
**Solution:**
- Ensure correct permissions are set (File content, Current user, File metadata)
- Regenerate a new token
- Confirm the file is visible to your account

#### 2. Node Not Found (404 Not Found)
**Cause:** Incorrect node ID or no access permission  
**Solution:**
- Right-click the component in Figma and select "Copy link"
- Confirm the file and node are visible to you
- Check if the URL format is correct

#### 3. Windows Command Line Issues
**Problem:** `'m' is not recognized as an internal or external command` error  
**Solution:**
```bash
# Use quotes around URLs
figma-to-rn generate --token="token" --url="complete URL" --output="./components"

# Or use Node.js script
node direct-run.js
```

## 🤝 Contributing Guidelines

We welcome community contributions! Please follow these steps:

### Development Environment Setup

```bash
# Clone repository
git clone https://github.com/figma-to-rn-toolkit/figma-to-rn-toolkit.git
cd figma-to-rn-toolkit

# Install dependencies
npm install

# Build project
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

### Contribution Process

1. **Fork the project** - Click the Fork button in the top right corner of the repository
2. **Create a branch** - `git checkout -b feature/your-feature-name`
3. **Commit changes** - `git commit -m "Add: your feature description"`
4. **Push branch** - `git push origin feature/your-feature-name`  
5. **Create PR** - Create a Pull Request on GitHub

### Code Standards

- Write code in TypeScript
- Follow ESLint configuration
- Add appropriate unit tests
- Update relevant documentation

## 📦 NPM Version Release Process

### For Maintainers: Publishing New Versions

#### 1. Pre-release Checklist
```bash
# Ensure all tests pass
npm test

# Lint and format code
npm run lint:fix
npm run format

# Build the project
npm run build

# Verify build output
ls dist/
```

#### 2. Version Update
```bash
# For patch version (1.2.0 → 1.2.1)
npm version patch

# For minor version (1.2.0 → 1.3.0)
npm version minor

# For major version (1.2.0 → 2.0.0)
npm version major

# For pre-release (1.2.0 → 1.2.1-beta.0)
npm version prerelease --preid=beta
```

#### 3. Update Documentation
- Update CHANGELOG.md with new version features
- Update README if needed
- Verify all examples work with new version

#### 4. Publish to NPM
```bash
# Publish stable version
npm publish

# Publish pre-release version
npm publish --tag beta

# Publish with specific tag
npm publish --tag next
```

#### 5. Post-publish Tasks
```bash
# Push changes and tags to GitHub
git push origin main
git push origin --tags

# Create GitHub release
gh release create v1.2.1 --title "v1.2.1" --notes "Release notes here"
```

#### 6. Automated Scripts
The project includes automated version management:
```bash
# These run automatically with npm version
npm run version    # Formats code and stages changes
npm run postversion # Pushes to git and creates tags
```

#### 7. NPM Package Management
```bash
# Check package status
npm whoami
npm info figma-to-rn-toolkit

# Manage package access
npm owner ls figma-to-rn-toolkit
npm owner add <username> figma-to-rn-toolkit

# Deprecate old versions
npm deprecate figma-to-rn-toolkit@1.0.0 "Please upgrade to latest version"
```

## 📈 Version Compatibility

| Toolkit Version | React Native | Node.js | TypeScript |
|----------------|-------------|---------|------------|
| 1.2.x | >=0.65.0 | >=16.0.0 | >=4.0.0 |
| 1.1.x | >=0.63.0 | >=14.0.0 | >=3.8.0 |
| 1.0.x | >=0.60.0 | >=12.0.0 | >=3.5.0 |

## 🔒 Security

### Token Security Best Practices

1. **Environment Variable Storage**
```bash
# .env file
FIGMA_TOKEN=your_token_here

# Usage
figma-to-rn generate --token="${FIGMA_TOKEN}" --url="..."
```

2. **CI/CD Integration**
```yaml
# GitHub Actions example
- name: Generate Components
  env:
    FIGMA_TOKEN: ${{ secrets.FIGMA_TOKEN }}
  run: figma-to-rn batch --token="$FIGMA_TOKEN" --file="urls.txt"
```

3. **Minimal Permissions**
- Only grant necessary read permissions
- Regularly update tokens
- Don't hardcode tokens in code

## Cursor Figma Plugin Integration

This toolkit works with the [Cursor Figma plugin](https://cursor.com/en-US/marketplace/figma) to provide AI-powered Figma-to-React-Native conversion.

### How It Works

The Cursor Figma plugin has an `implement-design` skill that reads Figma design data via MCP and generates code. This toolkit provides **React Native-specific design system rules** (`.cursor/rules/figma-design-system.mdc`) that teach the plugin how to generate proper RN code -- using `StyleSheet.create()`, correct flexbox mapping, cross-platform shadows, proper component structure, etc.

### Quick Setup for Any RN Project

**Step 1: Install the Cursor Figma plugin** (one-time, in Cursor IDE)

In Cursor Chat, type:
```
/add-plugin figma
```

**Step 2: Copy RN design rules to your project**

```bash
npx figma-rn-setup /path/to/your-rn-project
```

This copies:
- `.cursor/rules/figma-design-system.mdc` (RN-specific rules for the Figma plugin)
- `.cursorignore` (excludes `node_modules`, `Pods`, `build` etc. from indexing)

**Step 3: Use in Cursor Chat**

Open your RN project in Cursor, then in Chat:
```
implement design https://figma.com/design/ABC123/MyApp?node-id=1-2
```

The Figma plugin will read the design via MCP and generate a React Native component following the rules in `figma-design-system.mdc`.

### Three Ways to Use This Toolkit

| Approach | When to Use | Command |
|----------|-------------|---------|
| **A. Cursor Figma Plugin** (AI) | Complex designs, responsive layouts, design token extraction | `implement design <figma-url>` in Cursor Chat |
| **B. CLI** (Deterministic) | Batch processing, CI/CD, reproducible output | `npx figma-to-rn generate -u <url> -o ./src/components` |
| **C. Programmatic API** | Custom pipelines, build tool integration | `import { FigmaToReactNative } from 'figma-to-rn-toolkit'` |

**Approach A** leverages the Cursor AI agent to interpret design intent and produce idiomatic RN code. **Approach B** uses the Figma REST API directly for deterministic output. **Approach C** gives full programmatic control for custom build pipelines.

## 📝 Changelog

### v1.5.0
- Added Cursor Figma plugin integration with RN design system rules
- Added `figma-rn-setup` CLI for one-command project setup
- Fixed `package.json` main/types pointing to wrong entry
- Fixed `tsconfig.json` missing `mcp-cli.ts` in includes
- Added `.cursorignore` for Codebase Indexing optimization

### v1.2.0
- ✨ Added MCP (Model Context Protocol) real-time access support
- 🔧 Improved Windows command-line compatibility
- 📋 Complete TypeScript type definitions
- 🎨 Optimized code generation quality
- 🐛 Fixed known issues

### v1.1.0
- 🔄 Improved component structure parsing
- 📱 Enhanced React Native style conversion
- 🛠️ Added batch processing functionality
- 📚 Improved documentation and examples

### v1.0.0
- 🎉 First stable release
- ✅ Basic Figma API integration
- 📱 React Native component generation
- 🛠️ CLI tools

[View Complete Changelog](CHANGELOG.md)

## 🆘 Getting Help

### Community Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/figma-to-rn-toolkit/figma-to-rn-toolkit/issues)
- **Discussions**: [Community discussions and Q&A](https://github.com/figma-to-rn-toolkit/figma-to-rn-toolkit/discussions)
- **Wiki**: [Detailed documentation and tutorials](https://github.com/figma-to-rn-toolkit/figma-to-rn-toolkit/wiki)

### Commercial Support

For professional support, custom development, or enterprise training, please contact:
- 📧 Email: support@figma-to-rn-toolkit.com
- 🌐 Website: https://figma-to-rn-toolkit.com

## 📄 License

This project is licensed under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2025 Figma to RN Toolkit Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

Thanks to the following projects and contributors:

- [Figma API](https://www.figma.com/developers/api) - Providing powerful design data access
- [React Native](https://reactnative.dev/) - Cross-platform mobile application framework
- [TypeScript](https://www.typescriptlang.org/) - JavaScript type system
- All community members who contributed code, documentation, and feedback

## 📝 Changelog

### [1.2.0] - 2025-01-04

#### Added
- ✨ Added MCP (Model Context Protocol) real-time access support
- 🛠️ New `figma-mcp` command-line tool
- 📡 Implemented SSE (Server-Sent Events) event listening
- 🔗 Deep integration with Claude Code
- 📋 Complete TypeScript type definitions and declaration files
- 🧪 Added Jest testing framework configuration
- 📏 Added ESLint and Prettier code standards

#### Improved
- 🔧 Optimized Windows command-line compatibility, resolved URL parsing issues
- 📁 Fully respect user-specified output paths
- 🏷️ Fixed custom component name loss issue, added smart recovery mechanism
- 🎨 Optimized code generation quality and readability
- 📚 Enhanced README.md documentation with detailed usage guides

#### Fixed
- 🐛 Fixed command-line argument parsing errors on Windows systems
- 🔨 Fixed issue where output path wasn't generated according to user specification
- 📝 Fixed issue where component names were overwritten by original Figma names
- 🔍 Improved error handling and user-friendly error messages

#### Technical Improvements
- 🏗️ Refactored NPM package structure with better modular design
- 📦 Optimized dependency management, reduced package size
- 🔐 Enhanced security, improved token handling mechanism
- 🚀 Improved build performance and development experience

### [1.1.0] - 2025-01-02

#### Added
- 🔄 Added recursive text detection functionality
- 🛠️ New batch processing capability
- 📋 Added component preview functionality

#### Improved
- 🎨 Improved component structure parsing algorithm
- 📱 Enhanced React Native style conversion accuracy
- 📚 Enhanced documentation and usage examples

#### Fixed
- 🐛 Fixed missing Text component import issue
- 🔨 Fixed nested component processing errors
- 📝 Improved API error handling

### [1.0.0] - 2025-01-01

#### Initial Release
- 🎉 Complete Figma to React Native conversion functionality
- ✅ Basic Figma API integration
- 📱 React Native component code generation
- 🛠️ CLI tool support
- 📋 TypeScript support
- 🎨 Style converter
- 📚 Basic documentation

### Version Notes
This project follows [Semantic Versioning](https://semver.org/) specifications:
- **Major version**: When you make incompatible API changes
- **Minor version**: When you add functionality in a backwards compatible manner
- **Patch version**: When you make backwards compatible bug fixes

---

<div align="center">

**🎨 Perfect Integration of Design and Code 🚀**

[⭐ Give us a Star](https://github.com/figma-to-rn-toolkit/figma-to-rn-toolkit) | [🐛 Report Issues](https://github.com/figma-to-rn-toolkit/figma-to-rn-toolkit/issues) | [💡 Feature Requests](https://github.com/figma-to-rn-toolkit/figma-to-rn-toolkit/issues/new?template=feature_request.md)

Made with ❤️ by the Figma to RN Toolkit Team

</div>