# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Figma to React Native Toolkit is a comprehensive toolkit for automatically converting Figma designs to React Native components, with MCP (Model Context Protocol) real-time access support. The project is written in TypeScript and provides both CLI tools and programmatic API interfaces.

## Common Development Commands

### Build and Development
- `npm run build` - Compile TypeScript code to dist directory
- `npm run dev` - Run development mode (ts-node src/index.ts)
- `npm run prepare` - Pre-build (automatically runs build)

### CLI Tool Debugging
- `npm run cli` - Run main CLI tool (ts-node cli.ts)
- `npm run mcp` - Run MCP CLI tool (ts-node mcp-cli.ts)
- `npm run demo` - Run basic demo (ts-node demo.ts)
- `npm run demo:mcp` - Run MCP demo

### MCP Related Commands
- `npm run mcp:connect` - Connect to MCP server
- `npm run mcp:status` - Check MCP server status
- `npm run mcp:generate` - Generate component from current selection
- `npm run mcp:context` - Get MCP context
- `npm run mcp:interactive` - Interactive MCP mode

### Testing
- `npm test` - Run all tests (Jest)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:mcp` - Run MCP related tests

### Code Quality
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code using Prettier

## Core Architecture

### Directory Structure
```
src/
├── api/           # Figma API clients
├── generator/     # React Native code generators
├── mcp/          # MCP (Model Context Protocol) integration
├── parser/       # Figma node parsers
├── types/        # TypeScript type definitions
└── utils/        # Utility functions
```

### Main Components

#### 1. FigmaAPI (src/api/)
- `FigmaAPI.ts` - Core Figma API client
- `FigmaAPIClient.ts` - API request handling

#### 2. ReactNativeGenerator (src/generator/)
- Responsible for converting parsed Figma nodes to React Native component code
- Generates TypeScript interfaces, component code and styles

#### 3. ComponentParser & StyleParser (src/parser/)
- `ComponentParser.ts` - Parse Figma component structure and properties
- `StyleParser.ts` - Convert Figma styles to React Native StyleSheet

#### 4. MCP Integration (src/mcp/)
- `FigmaMCPClient.ts` - MCP client implementation
- `FigmaMCPIntegration.ts` - Integration between MCP and Figma API

#### 5. Main Entry Points
- `index.ts` - Main library entry point, exports FigmaToReactNative class
- `cli.ts` - CLI tool entry point
- `mcp-cli.ts` - MCP CLI tool entry point

### Data Flow
1. Figma URL → FigmaAPI → Retrieve node data
2. FigmaNode → ComponentParser → Component structure analysis
3. FigmaNode → StyleParser → Style conversion
4. Parsed results → ReactNativeGenerator → Generate React Native code

## Type System

### Core Types (src/types/index.ts)
- `FigmaNode` - Figma node data structure
- `ReactNativeComponentSpec` - Generated component specification
- `GenerationOptions` - Code generation options
- `FigmaAPIError`, `ParseError`, `GenerationError` - Error types

### Important Interfaces
- `FigmaToReactNative` - Main converter class
- `FigmaMCPIntegration` - MCP integration class

## Development Best Practices

### TypeScript Configuration
- Use strict mode (`"strict": true`)
- Output to `dist/` directory
- Support path alias `@/*` → `src/*`

### Test Configuration
- Use Jest + ts-jest
- Test files located in `tests/` directory
- Support `**/*.test.ts` and `**/*.spec.ts` patterns

### CLI Development Notes
- Main CLI commands run through `figma-to-rn` executable
- MCP CLI commands run through `figma-mcp` executable
- Windows compatibility: Use double quotes around parameters, handle path issues

### Error Handling
- Use custom error classes (`FigmaAPIError`, `ParseError`, `GenerationError`)
- API calls need proper error handling and retry mechanisms
- Provide meaningful error messages to users

## Important Development Details

### Figma API Integration
- Requires Figma Personal Access Token
- Supports file-level and node-level data retrieval
- Handle API limits and error responses

### React Native Code Generation
- Generate code following latest React Native best practices
- Support TypeScript interface generation
- Smart style conversion (Figma → StyleSheet)
- Support test file generation

### MCP Support
- Real-time access to current Figma selection
- Support interactive component generation
- Provide context-aware conversion

## Important Notes

- Pay attention to parameter escaping when running CLI on Windows
- Monitor memory usage when converting large files
- API call rate limits require appropriate delay handling
- Generated components need testing for compatibility in target React Native projects