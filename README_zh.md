# Figma to React Native Toolkit

<div align="center">

**🌍 Languages / 语言选择:** [English](README.md) | [中文](README_zh.md)

---

🎨 **将 Figma 设计自动转换为 React Native 组件的综合工具包**

[![NPM Version](https://img.shields.io/npm/v/figma-to-rn-toolkit.svg)](https://www.npmjs.com/package/figma-to-rn-toolkit)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-Compatible-green.svg)](https://reactnative.dev/)

[GitHub](https://github.com/StarksJohn/figma-to-rn-toolkit) | [NPM](https://www.npmjs.com/package/figma-to-rn-toolkit) | [问题反馈](https://github.com/StarksJohn/figma-to-rn-toolkit/issues)

</div>

## 🚀 简介

Figma to React Native Toolkit 是一个功能强大的开源工具包，专为将 Figma 设计自动转换为高质量的 React Native 组件而设计。支持最新的 MCP（Model Context Protocol）实时访问，让设计到代码的转换更加高效和准确。

### ✨ 核心特性

- 🎨 **智能设计解析** - 自动分析 Figma 设计结构和样式
- 📱 **React Native 代码生成** - 生成可直接使用的 TypeScript 组件
- 🔄 **实时 MCP 支持** - 通过 Model Context Protocol 实时访问 Figma
- 🎯 **精准样式转换** - Figma 样式到 React Native StyleSheet 的完美转换
- 📋 **TypeScript 支持** - 完整的类型定义和代码补全
- 🛠️ **CLI 工具** - 强大的命令行界面，支持批量处理
- 🔧 **可扩展架构** - 模块化设计，易于定制和扩展
- 🌍 **跨平台兼容** - 支持 Windows、macOS 和 Linux

## 📦 安装

### NPM 安装
```bash
npm install -g figma-to-rn-toolkit
```

### Yarn 安装
```bash
yarn global add figma-to-rn-toolkit
```

### 开发依赖安装
```bash
npm install --save-dev figma-to-rn-toolkit
```

## 🏗️ 系统要求

- **Node.js**: >=16.0.0
- **NPM**: >=8.0.0
- **React Native**: >=0.65.0 (peerDependency)
- **TypeScript**: >=4.0.0 (推荐)

## 🆕 新功能：快速获取 Figma 节点信息

### 简单直接的 API 调用

如果您的 RN 项目只需要获取 Figma 节点的原始信息（而不需要生成完整的组件代码），可以使用新增的 `getFigmaNodeInfo` 函数：

```javascript
import { getFigmaNodeInfo } from 'figma-to-rn-toolkit';

// 您的 Figma Token 和 URL
const token = 'YOUR_FIGMA_TOKEN';
const url = 'https://www.figma.com/design/ABC123/MyDesign?node-id=2%3A4';

// 获取节点信息
const nodeInfo = await getFigmaNodeInfo(token, url);

// 使用返回的节点信息
console.log('节点名称:', nodeInfo.name);
console.log('节点类型:', nodeInfo.type);
console.log('节点尺寸:', nodeInfo.absoluteBoundingBox);
console.log('填充颜色:', nodeInfo.fills);
console.log('边框样式:', nodeInfo.strokes);
```

### 如何获取 Figma URL

1. 在 Figma 中选中任意元素
2. 右键点击选中的元素
3. 选择 **"Copy link to selection"** (复制选中内容的链接)
4. 粘贴的 URL 即可直接使用

### 返回的节点信息

`getFigmaNodeInfo` 返回包含完整 Figma 节点数据的对象，包括：
- 基本信息：`id`, `name`, `type`, `visible`
- 尺寸位置：`absoluteBoundingBox`
- 样式属性：`fills`, `strokes`, `effects`
- 布局属性：`constraints`, `layoutMode`, `padding`
- 子节点：`children` (如果存在)
- 其他 Figma 属性

详细示例请查看 `examples/get-node-info.ts`

## 🎯 快速开始

### 1. 获取 Figma Access Token

前往 [Figma Settings > Personal Access Tokens](https://www.figma.com/settings/tokens) 创建新的访问令牌

**必需权限设置：**
- ✅ **File content** → Read
- ✅ **Current user** → Read  
- ✅ **File metadata** → Read

### 2. 基本使用

#### 命令行方式（推荐）
```bash
# 生成单个组件
figma-to-rn generate \
  --token="YOUR_FIGMA_TOKEN" \
  --url="https://www.figma.com/design/YOUR_FILE_ID/Design?node-id=NODE_ID" \
  --output="./components" \
  --name="CustomButton"

# 预览组件信息
figma-to-rn preview \
  --token="YOUR_FIGMA_TOKEN" \
  --url="YOUR_FIGMA_URL"

# 批量生成组件
figma-to-rn batch \
  --token="YOUR_FIGMA_TOKEN" \
  --file="./urls.txt" \
  --output="./components"
```

#### 编程方式
```typescript
import { FigmaToReactNative } from 'figma-to-rn-toolkit';

const converter = new FigmaToReactNative('YOUR_FIGMA_TOKEN', {
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

#### Node.js 脚本方式
对于需要快速测试或在Windows环境下避免命令行参数问题，可以使用项目内置的直接执行脚本：

**方式一：直接使用内置脚本**
```bash
node direct-run.js
```

**方式二：修改脚本配置**
编辑 `direct-run.js` 文件，更新配置参数：
```javascript
const config = {
  token: "YOUR_FIGMA_TOKEN",
  url: "https://www.figma.com/design/YOUR_FILE_ID/Design?node-id=YOUR_NODE_ID",
  output: "components",
  name: "YourComponentName"
};
```

**方式三：创建自定义脚本**
```javascript
// 创建 your-script.js 文件
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

    console.log(`✅ 组件 ${component.name} 生成成功！`);
  } catch (error) {
    console.error('❌ 生成失败:', error.message);
  }
}

generateComponent();
```

### 3. MCP 实时访问（高级功能）

```bash
# 检查 MCP 服务器状态
figma-mcp status

# 连接到 Figma MCP
figma-mcp connect

# 从当前选择生成组件
figma-mcp generate-selection

# 交互式模式
figma-mcp interactive
```

## 📋 功能详述

### 支持的 Figma 功能

| 功能 | 支持状态 | 说明 |
|------|---------|------|
| 基本形状 | ✅ 完全支持 | 矩形、圆形、线条等 |
| 文本样式 | ✅ 完全支持 | 字体、大小、颜色、对齐 |
| Auto Layout | ✅ 完全支持 | 转换为 Flexbox 布局 |
| 颜色填充 | ✅ 完全支持 | 纯色、渐变色 |
| 描边样式 | ✅ 完全支持 | 边框样式和颜色 |
| 圆角 | ✅ 完全支持 | 统一和独立圆角 |
| 阴影效果 | ✅ 完全支持 | Drop Shadow 和 Inner Shadow |
| 透明度 | ✅ 完全支持 | 元素透明度 |
| 组件实例 | 🔄 部分支持 | 基本实例转换 |
| 布尔运算 | 🔄 部分支持 | 转换为图片资源 |
| 复杂路径 | 🔄 部分支持 | 转换为 SVG 组件 |
| 动画 | ❌ 暂不支持 | 计划在未来版本中支持 |

### 生成的代码结构

工具会生成类似以下结构的 React Native 组件：

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

## 🛠️ CLI 命令参考

### generate 命令
生成 React Native 组件

```bash
figma-to-rn generate [options]
```

**选项：**
- `-t, --token <token>` - Figma 访问令牌（必需）
- `-u, --url <url>` - Figma 组件 URL（必需）
- `-o, --output <path>` - 输出目录（默认：./components）
- `-n, --name <name>` - 自定义组件名
- `--no-typescript` - 生成 JavaScript 代码
- `--no-stylesheet` - 使用内联样式
- `--tests` - 生成测试文件
- `--no-format` - 跳过代码格式化

### preview 命令
预览组件信息而不生成代码

```bash
figma-to-rn preview --token="TOKEN" --url="URL"
```

### batch 命令
批量处理多个组件

```bash
figma-to-rn batch --token="TOKEN" --file="urls.txt" --output="./components"
```

### validate 命令
验证 token 和 URL 格式

```bash
figma-to-rn validate --token="TOKEN" --url="URL"
```

## 🔧 配置选项

### GenerationOptions 接口

```typescript
interface GenerationOptions {
  outputPath: string;           // 输出路径
  componentName?: string;       // 组件名
  includeTypes?: boolean;       // 生成 TypeScript 类型
  useStyleSheet?: boolean;      // 使用 StyleSheet
  generateTests?: boolean;      // 生成测试文件
  formatCode?: boolean;         // 代码格式化
}
```

## 📚 API 参考

### 主要类

#### FigmaToReactNative
主要的转换器类

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
MCP 集成类

```typescript
class FigmaMCPIntegration {
  constructor(options: MCPOptions);
  
  async connect(): Promise<void>;
  async generateFromSelection(options: GenerationOptions): Promise<ComponentSpec>;
  async getContext(): Promise<MCPContext>;
}
```

## 🔌 在 React Native 项目中结合 Cursor Figma 插件使用

本节介绍如何在你的 React Native 项目中，将 `figma-to-rn-toolkit` 与 [Cursor Figma 插件](https://cursor.com) 结合使用，实现从 Figma 设计稿到生产级 RN 组件的高效转换。

### 前置条件

| 条件 | 说明 |
|------|------|
| Cursor IDE | 已安装 [Cursor](https://cursor.com) 编辑器 |
| Figma 插件 | 在 Cursor 中安装 **Figma** 插件（Settings > Plugins > 搜索 Figma） |
| Figma MCP 认证 | 首次使用需在 Cursor Chat 中执行 MCP 认证（见下文） |
| Figma Token | 拥有 Figma Personal Access Token（用于 CLI/API 方式） |
| figma-to-rn-toolkit | 已在你的 RN 项目中安装本工具包 |

### Step 1: 在 RN 项目中安装 figma-to-rn-toolkit

```bash
# 作为开发依赖安装
npm install --save-dev figma-to-rn-toolkit

# 或全局安装（推荐，可在多个项目间共享 CLI）
npm install -g figma-to-rn-toolkit
```

在项目根目录创建 `.env` 文件：

```bash
FIGMA_TOKEN=your_figma_personal_access_token_here
```

### Step 2: 启用 Cursor Figma 插件并完成认证

1. 打开 Cursor IDE，进入 **Settings > Plugins**
2. 搜索 **Figma** 并安装插件（如已安装则跳过）
3. 安装后你将获得三个 Skill 和一个 Figma MCP Server：

| 能力 | 说明 |
|------|------|
| **implement-design** | 将 Figma 设计翻译为生产级代码，1:1 视觉还原 |
| **code-connect-components** | 将 Figma 组件与代码组件建立双向映射 |
| **create-design-system-rules** | 为项目生成自定义设计系统规则 |
| **Figma MCP Server** | 提供 `get_design_context`、`get_screenshot`、`get_metadata` 等 MCP 工具 |

4. **认证 Figma MCP Server**：在 Cursor Chat 中发送以下内容触发认证流程：

```
请连接 Figma MCP 服务器
```

Cursor 会自动调用 `mcp_auth` 工具，弹出 Figma OAuth 授权页面，点击允许即可。认证成功后，后续所有 Figma MCP 工具即可正常使用。

### Step 3: 三种使用工作流

根据你的场景选择最合适的工作流：

---

#### 工作流 A: implement-design — 从 Figma URL 直接生成 RN 组件（推荐）

**适用场景**: 拿到设计师的 Figma URL，需要快速实现为 RN 组件。

**操作步骤**：

1. 从 Figma 中复制目标组件的链接，格式如：
   ```
   https://www.figma.com/design/FILE_KEY/FileName?node-id=42-15
   ```

2. 在 Cursor Chat 中输入：
   ```
   请根据这个 Figma 设计实现 React Native 组件：
   https://www.figma.com/design/FILE_KEY/FileName?node-id=42-15

   要求：
   - 使用 TypeScript
   - 使用 StyleSheet.create()
   - 组件放在 src/components/ 目录
   - 组件名为 PaymentCard
   ```

3. Cursor 会自动执行以下流程：
   - 调用 `get_design_context` 获取设计数据（布局、颜色、字体、间距等）
   - 调用 `get_screenshot` 获取视觉参考截图
   - 下载设计中的图片/图标资源
   - 将 Figma 输出翻译为 RN 组件代码（StyleSheet + TypeScript）
   - 对照截图进行视觉验证

4. 生成的组件会直接写入你的项目目录中。

**与 figma-to-rn-toolkit 结合使用**：

你也可以同时利用 toolkit 的 API 来获取原始节点数据，做更精细的样式转换：

```typescript
import { getFigmaNodeInfo, figmaNodeToRNStyles } from 'figma-to-rn-toolkit';

const nodeInfo = await getFigmaNodeInfo(process.env.FIGMA_TOKEN!, figmaUrl);
const rnStyles = figmaNodeToRNStyles(nodeInfo);
```

---

#### 工作流 B: code-connect-components — 将已有 RN 组件与 Figma 设计绑定

**适用场景**: 项目中已有 RN 组件库，需要与 Figma 设计系统建立双向关联。

> 注意: Code Connect 功能需要 Figma Organization 或 Enterprise 计划，且组件必须已发布到 Team Library。

**操作步骤**：

1. 在 Cursor Chat 中输入：
   ```
   请将这个 Figma 组件与我的代码关联：
   https://www.figma.com/design/FILE_KEY/DesignSystem?node-id=10-50
   ```

2. Cursor 会自动：
   - 调用 `get_code_connect_suggestions` 获取未映射的 Figma 组件列表
   - 扫描你的代码库（`src/components/` 等目录），匹配对应的 RN 组件
   - 展示匹配结果供你确认
   - 调用 `send_code_connect_mappings` 创建映射关系

3. 映射建立后，设计师在 Figma 中查看组件时可直接看到对应的代码实现路径。

---

#### 工作流 C: create-design-system-rules — 为项目生成设计系统规则

**适用场景**: 希望 AI 在后续所有 Figma 实现任务中自动遵循项目约定。

**操作步骤**：

1. 在 Cursor Chat 中输入：
   ```
   请为我的 React Native 项目创建设计系统规则
   ```

2. Cursor 会自动：
   - 调用 `create_design_system_rules` 获取规则模板
   - 分析项目代码结构、样式方案、组件约定
   - 生成 `.cursor/rules/figma-design-system.mdc` 规则文件

3. 规则文件内容示例：

```markdown
---
description: "Figma to RN design system rules"
globs: "src/components/**"
alwaysApply: false
---

## Component Organization
- UI components are in `src/components/`
- Use StyleSheet.create() for all styles
- Follow PascalCase naming convention

## Figma Implementation Flow
1. Run get_design_context for the node
2. Run get_screenshot for visual reference
3. Translate Figma output to React Native with StyleSheet
4. Reuse existing components when possible
5. Validate against screenshot before completing

## Style Conventions
- IMPORTANT: Never hardcode colors, use project theme tokens
- IMPORTANT: Use platform-aware dimensions (PixelRatio if needed)
- Spacing follows the 4px base scale
```

4. 后续所有 Figma 实现任务都会自动遵循这些规则，保证全项目一致性。

### 完整的推荐工作流程

以下是在一个新 React Native 项目中从零开始使用的推荐步骤：

```
Step 1: 安装 figma-to-rn-toolkit
         npm install --save-dev figma-to-rn-toolkit

Step 2: 在 Cursor 中安装并认证 Figma 插件

Step 3: 生成设计系统规则（工作流 C）
         => 生成 .cursor/rules/figma-design-system.mdc

Step 4: 开始实现设计稿（工作流 A）
         => 在 Cursor Chat 中粘贴 Figma URL，AI 自动生成 RN 组件

Step 5: 建立组件关联（工作流 B，可选）
         => 将已有组件与 Figma 设计绑定

Step 6: 迭代优化
         => 利用 toolkit API 做精细样式调整
         => 更新设计系统规则以匹配团队约定
```

### CLI 方式与 Cursor 插件方式对比

| 维度 | CLI / API 方式 | Cursor Figma 插件方式 |
|------|---------------|---------------------|
| **交互方式** | 命令行 / 代码调用 | Cursor Chat 自然语言对话 |
| **适合场景** | CI/CD 批量生成、脚本自动化 | 日常开发、交互式组件实现 |
| **设计还原度** | 基于解析规则的结构化转换 | AI 驱动 + 截图视觉验证，更高精度 |
| **MCP 工具** | 内置 SSE 客户端（`figma-mcp`） | Figma 官方 MCP（`get_design_context` 等） |
| **结合方式** | 单独使用或导出原始数据供 AI 消费 | 直接在 Cursor 中使用 AI 生成组件 |

**最佳实践**: 日常开发推荐使用 Cursor Figma 插件（交互式、高保真），CI/CD 或批量任务使用 CLI 方式（可自动化、可脚本化）。两者可以互补，例如先用插件生成基础组件，再用 toolkit API 做批量样式微调。

### 常见问题

#### Q: Figma MCP 工具不可用？

确保已完成以下步骤：
1. Cursor 中已安装 Figma 插件
2. 已在 Chat 中触发过 MCP 认证（发送"连接 Figma MCP"）
3. Figma OAuth 弹窗中已点击"允许"
4. 如仍不可用，尝试重启 Cursor

#### Q: implement-design 生成的代码是 React + Tailwind 而不是 React Native？

Figma MCP 默认输出 React + Tailwind 的中间表示。在 Cursor Chat 中明确指定你的技术栈：

```
请用 React Native + StyleSheet 实现这个设计（不要使用 Tailwind）：
https://www.figma.com/design/...
```

或者先通过**工作流 C**生成设计系统规则，规则中会明确 React Native + StyleSheet 约定，后续所有实现任务自动遵循。

#### Q: 如何在没有 Cursor 的环境中使用？

直接使用 figma-to-rn-toolkit 的 CLI 或 API 即可，不依赖 Cursor：

```bash
# CLI 方式
figma-to-rn generate --token="$FIGMA_TOKEN" --url="FIGMA_URL" --output="./components"

# API 方式
import { getFigmaNodeInfo } from 'figma-to-rn-toolkit';
const nodeInfo = await getFigmaNodeInfo(token, url);
```

#### Q: Code Connect 映射失败？

检查以下条件：
- Figma 计划需为 Organization 或 Enterprise
- 组件必须已发布到 Team Library（右键 > Publish to library）
- Figma URL 中必须包含 `node-id` 参数
- 你对 Figma 文件有编辑权限

## 🚨 故障排除

### 常见问题

#### 1. Token 权限错误 (403 Forbidden)
**原因：** 权限设置不正确  
**解决方案：**
- 确保设置了正确的权限（File content、Current user、File metadata）
- 重新生成新的 token
- 确认文件对你的账户可见

#### 2. 找不到节点 (404 Not Found)
**原因：** 节点 ID 错误或无权访问  
**解决方案：**
- 在 Figma 中右键组件选择 "Copy link"
- 确认文件和节点对你可见
- 检查 URL 格式是否正确

#### 3. Windows 命令行问题
**问题：** 出现 `'m' 不是内部或外部命令` 错误  
**解决方案：**
```bash
# 使用引号包围 URL
figma-to-rn generate --token="token" --url="完整URL" --output="./components"

# 或使用 Node.js 脚本
node direct-run.js
```

## 🤝 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/figma-to-rn-toolkit/figma-to-rn-toolkit.git
cd figma-to-rn-toolkit

# 安装依赖
npm install

# 构建项目
npm run build

# 运行测试
npm test

# 启动开发模式
npm run dev
```

### 贡献流程

1. **Fork 项目** - 点击仓库右上角的 Fork 按钮
2. **创建分支** - `git checkout -b feature/your-feature-name`
3. **提交更改** - `git commit -m "Add: your feature description"`
4. **推送分支** - `git push origin feature/your-feature-name`  
5. **创建 PR** - 在 GitHub 上创建 Pull Request

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 配置
- 添加适当的单元测试
- 更新相关文档

## 📦 NPM 版本发布流程

### 维护者指南：发布新版本

#### 1. 发布前检查清单
```bash
# 确保所有测试通过
npm test

# 代码检查和格式化
npm run lint:fix
npm run format

# 构建项目
npm run build

# 验证构建输出
ls dist/
```

#### 2. 版本更新
```bash
# 补丁版本 (1.2.0 → 1.2.1)
npm version patch

# 次要版本 (1.2.0 → 1.3.0)
npm version minor

# 主要版本 (1.2.0 → 2.0.0)
npm version major

# 预发布版本 (1.2.0 → 1.2.1-beta.0)
npm version prerelease --preid=beta
```

#### 3. 更新文档
- 更新 CHANGELOG.md 添加新版本特性
- 根据需要更新 README
- 验证所有示例在新版本中正常工作

#### 4. 发布到 NPM
```bash
# 发布稳定版本
npm publish

# 发布预发布版本
npm publish --tag beta

# 发布指定标签版本
npm publish --tag next
```

#### 5. 发布后任务
```bash
# 推送更改和标签到 GitHub
git push origin main
git push origin --tags

# 创建 GitHub 发布
gh release create v1.2.1 --title "v1.2.1" --notes "发布说明"
```

#### 6. 自动化脚本
项目包含自动化版本管理：
```bash
# 这些脚本会在 npm version 时自动运行
npm run version    # 格式化代码并暂存更改
npm run postversion # 推送到 git 并创建标签
```

#### 7. NPM 包管理
```bash
# 检查包状态
npm whoami
npm info figma-to-rn-toolkit

# 管理包访问权限
npm owner ls figma-to-rn-toolkit
npm owner add <username> figma-to-rn-toolkit

# 废弃旧版本
npm deprecate figma-to-rn-toolkit@1.0.0 "请升级到最新版本"
```

## 📈 版本兼容性

| Toolkit 版本 | React Native | Node.js | TypeScript |
|-------------|-------------|---------|------------|
| 1.2.x | >=0.65.0 | >=16.0.0 | >=4.0.0 |
| 1.1.x | >=0.63.0 | >=14.0.0 | >=3.8.0 |
| 1.0.x | >=0.60.0 | >=12.0.0 | >=3.5.0 |

## 🔒 安全性

### Token 安全最佳实践

1. **环境变量存储**
```bash
# .env 文件
FIGMA_TOKEN=your_token_here

# 使用
figma-to-rn generate --token="${FIGMA_TOKEN}" --url="..."
```

2. **CI/CD 集成**
```yaml
# GitHub Actions 示例
- name: Generate Components
  env:
    FIGMA_TOKEN: ${{ secrets.FIGMA_TOKEN }}
  run: figma-to-rn batch --token="$FIGMA_TOKEN" --file="urls.txt"
```

3. **权限最小化**
- 只授予必要的读取权限
- 定期更新 token
- 不要在代码中硬编码 token

## 📝 更新日志

### v1.2.0 (最新)
- ✨ 新增 MCP (Model Context Protocol) 实时访问支持
- 🔧 改进 Windows 命令行兼容性
- 📋 完整的 TypeScript 类型定义
- 🎨 优化代码生成质量
- 🐛 修复已知问题

### v1.1.0
- 🔄 改进组件结构解析
- 📱 增强 React Native 样式转换
- 🛠️ 新增批量处理功能
- 📚 完善文档和示例

### v1.0.0
- 🎉 首个稳定版本发布
- ✅ 基础 Figma API 集成
- 📱 React Native 组件生成
- 🛠️ CLI 工具

[查看完整更新日志](CHANGELOG.md)

## 🆘 获取帮助

### 社区支持

- **GitHub Issues**: [报告 Bug 或请求功能](https://github.com/figma-to-rn-toolkit/figma-to-rn-toolkit/issues)
- **Discussions**: [社区讨论和问答](https://github.com/figma-to-rn-toolkit/figma-to-rn-toolkit/discussions)
- **Wiki**: [详细文档和教程](https://github.com/figma-to-rn-toolkit/figma-to-rn-toolkit/wiki)

### 商业支持

如需专业支持、定制开发或企业培训，请联系：
- 📧 Email: support@figma-to-rn-toolkit.com
- 🌐 Website: https://figma-to-rn-toolkit.com

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

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

## 🙏 致谢

感谢以下项目和贡献者：

- [Figma API](https://www.figma.com/developers/api) - 提供强大的设计数据访问
- [React Native](https://reactnative.dev/) - 跨平台移动应用框架
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 类型系统
- 所有贡献代码、文档和反馈的社区成员

## 📝 更新日志

### [1.2.0] - 2025-01-04

#### 新增
- ✨ 增加 MCP (Model Context Protocol) 实时访问支持
- 🛠️ 新增 `figma-mcp` 命令行工具
- 📡 实现 SSE (Server-Sent Events) 事件监听
- 🔗 与 Claude Code 深度集成
- 📋 完整的 TypeScript 类型定义和声明文件
- 🧪 增加 Jest 测试框架配置
- 📏 增加 ESLint 和 Prettier 代码规范

#### 改进
- 🔧 优化 Windows 命令行兼容性，解决 URL 解析问题
- 📁 完全尊重用户指定的输出路径
- 🏷️ 修复自定义组件名称丢失问题，添加智能恢复机制
- 🎨 优化代码生成质量和可读性
- 📚 完善 README.md 文档，增加详细的使用指南

#### 修复
- 🐛 修复 Windows 系统下的命令行参数解析错误
- 🔨 修复输出路径不按用户指定生成的问题
- 📝 修复组件名称被原始 Figma 名称覆盖的问题
- 🔍 改进错误处理和用户友好的错误信息

#### 技术改进
- 🏗️ 重构 NPM 包结构，更好的模块化设计
- 📦 优化依赖管理，减少包体积
- 🔐 增强安全性，改进 token 处理机制
- 🚀 提升构建性能和开发体验

### [1.1.0] - 2025-01-02

#### 新增
- 🔄 增加递归文本检测功能
- 🛠️ 新增批量处理能力
- 📋 增加组件预览功能

#### 改进
- 🎨 改进组件结构解析算法
- 📱 增强 React Native 样式转换精度
- 📚 完善文档和使用示例

#### 修复
- 🐛 修复 Text 组件导入缺失问题
- 🔨 修复嵌套组件处理错误
- 📝 改进 API 错误处理

### [1.0.0] - 2025-01-01

#### 首次发布
- 🎉 完整的 Figma 到 React Native 转换功能
- ✅ 基础 Figma API 集成
- 📱 React Native 组件代码生成
- 🛠️ CLI 工具支持
- 📋 TypeScript 支持
- 🎨 样式转换器
- 📚 基础文档

### 版本说明
本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：
- **主版本号**：当你做了不兼容的 API 修改
- **次版本号**：当你做了向下兼容的功能性新增
- **修订号**：当你做了向下兼容的问题修正

---

<div align="center">

**🎨 让设计与代码完美融合 🚀**

[⭐ 给我们点个 Star](https://github.com/figma-to-rn-toolkit/figma-to-rn-toolkit) | [🐛 报告问题](https://github.com/figma-to-rn-toolkit/figma-to-rn-toolkit/issues) | [💡 功能建议](https://github.com/figma-to-rn-toolkit/figma-to-rn-toolkit/issues/new?template=feature_request.md)

Made with ❤️ by the Figma to RN Toolkit Team

</div>
