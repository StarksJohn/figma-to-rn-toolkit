# NPM 发布完整指南

## 📚 目录

- [快速开始](#快速开始)
- [前期准备](#前期准备)
- [一键发布](#一键发布)
- [工具文件说明](#工具文件说明)
- [NPM Scripts命令](#npm-scripts命令)
- [手动发布流程](#手动发布流程)
- [版本管理策略](#版本管理策略)
- [常见问题解决](#常见问题解决)
- [最佳实践](#最佳实践)

---

## 🚀 快速开始

### 一键发布（推荐）

#### Windows 用户
```bash
# 方式一：双击运行
npm-publish.bat

# 方式二：命令行运行, 让 CC 执行 : 
npm run publish:windows
```

#### 所有平台
```bash
# 使用 Node.js 脚本
npm run publish:auto
```

### 使用流程

#### 首次使用

1. **登录 NPM**
   ```bash
   npm login
   ```

2. **运行检查**
   ```bash
   npm run prepublish:check
   ```

3. **一键发布**
   ```bash
   npm run publish:auto
   ```

#### 日常发布

```bash
# 最简单的方式
npm run publish:auto

# 或者根据更新类型
npm run publish:patch   # Bug 修复
npm run publish:minor   # 新功能
npm run publish:major   # 重大变更
```

---

## 📁 工具文件说明

### 已创建的工具文件

| 文件名 | 用途 | 使用方法 |
|--------|------|----------|
| **pre-publish-check.js** | 发布前检查脚本 | `node pre-publish-check.js` |
| **publish-to-npm.js** | 一键发布主脚本 | `node publish-to-npm.js` |
| **npm-publish.bat** | Windows 批处理脚本 | 双击运行或 `npm-publish.bat` |
| **NPM发布指南.md** | 完整的中文文档 | 查阅详细说明 |
| **.npmignore** | 控制发布文件 | 自动生效 |

---

## 📋 NPM Scripts命令

已在 `package.json` 中配置的发布相关命令：

```bash
# 检查类
npm run prepublish:check     # 运行发布前检查

# 自动发布
npm run publish:auto         # 一键自动发布（推荐）
npm run publish:windows      # Windows 批处理发布

# 版本发布
npm run publish:patch        # 发布补丁版本 (1.0.0 -> 1.0.1)
npm run publish:minor        # 发布次要版本 (1.0.0 -> 1.1.0)
npm run publish:major        # 发布主要版本 (1.0.0 -> 2.0.0)

# 特殊发布
npm run publish:beta         # 发布 beta 版本
npm run publish:dry          # 模拟发布（不实际发布）
```

---

## 🚀 前期准备

### 1. 注册 NPM 账号

如果还没有 NPM 账号，请先注册：

1. 访问 [https://www.npmjs.com/signup](https://www.npmjs.com/signup)
2. 填写用户名、邮箱和密码
3. 验证邮箱地址
4. 设置双因素认证（推荐）

### 2. 配置 NPM 登录

```bash
# 登录 NPM
npm login

# 输入以下信息：
# Username: 你的用户名
# Password: 你的密码
# Email: 你的邮箱
# OTP: 双因素认证码（如果启用）

# 验证登录状态
npm whoami
```

### 3. 配置包信息

编辑 `package.json`，确保包含以下必要字段：

```json
{
  "name": "figma-to-rn-toolkit",           // 包名（必须唯一）
  "version": "1.0.0",                      // 版本号
  "description": "描述信息",               // 包描述
  "main": "dist/index.js",                 // 主入口文件
  "types": "dist/index.d.ts",              // TypeScript 类型定义
  "author": "作者名 <email@example.com>",  // 作者信息
  "license": "MIT",                        // 开源协议
  "keywords": ["figma", "react-native"],   // 关键词（便于搜索）
  "repository": {                          // 代码仓库
    "type": "git",
    "url": "https://github.com/username/repo.git"
  },
  "bugs": {                                // Bug 报告地址
    "url": "https://github.com/username/repo/issues"
  },
  "homepage": "https://github.com/username/repo#readme",
  "files": [                               // 要发布的文件
    "dist",
    "src",
    "README.md",
    "LICENSE"
  ]
}
```

### 4. 创建必要文件

#### .npmignore 文件
```
# 不发布到 NPM 的文件
.git
.gitignore
.idea
.vscode
*.log
*.lock
node_modules/
tests/
coverage/
.env
.DS_Store
*.map
*.test.js
*.spec.js
examples/
docs/
scripts/
```

#### LICENSE 文件
```
MIT License

Copyright (c) 2024 Your Name

Permission is hereby granted, free of charge...
```

#### README.md 文件
- 项目介绍
- 安装说明
- 使用示例
- API 文档
- 贡献指南

---

## 🎯 首次发布

### 检查包名是否可用

```bash
# 检查包名是否已被占用
npm view figma-to-rn-toolkit

# 如果返回 404 错误，说明包名可用
# 如果返回包信息，说明包名已被占用
```

### 运行发布前检查

```bash
# 运行自动检查脚本
node pre-publish-check.js

# 或手动检查
npm run lint        # 代码检查
npm test           # 运行测试
npm run build      # 构建项目
```

### 发布前检查项

自动检查脚本会验证以下内容：

- ✅ package.json 必要字段
- ✅ NPM 登录状态
- ✅ 包名可用性
- ✅ 构建文件存在
- ✅ 测试通过
- ✅ Git 状态
- ✅ 文件配置
- ✅ README 文档
- ✅ LICENSE 文件
- ✅ .npmignore 配置

---

## ⚡ 一键发布

### 使用自动化脚本

```bash
# 方式一：直接运行脚本
node publish-to-npm.js

# 方式二：通过 npm scripts
npm run publish:auto
```

脚本将自动执行以下步骤：
1. ✅ 发布前检查
2. ✅ 验证 NPM 登录
3. ✅ 清理并重新构建
4. ✅ 运行测试
5. ✅ 版本号更新
6. ✅ Git 提交
7. ✅ 预览发布内容
8. ✅ 确认并发布
9. ✅ 创建 Git 标签

### 添加到 package.json scripts

```json
{
  "scripts": {
    "prepublish:check": "node pre-publish-check.js",
    "publish:auto": "node publish-to-npm.js",
    "publish:patch": "npm version patch && npm publish",
    "publish:minor": "npm version minor && npm publish",
    "publish:major": "npm version major && npm publish"
  }
}
```

---

## 📝 手动发布流程

### 步骤 1：构建项目

```bash
# 清理旧文件
rm -rf dist

# 安装依赖
npm install

# 构建
npm run build
```

### 步骤 2：更新版本号

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
npm version patch

# 次要版本 (1.0.0 -> 1.1.0)
npm version minor

# 主要版本 (1.0.0 -> 2.0.0)
npm version major

# 或手动编辑 package.json 的 version 字段
```

### 步骤 3：发布到 NPM

```bash
# 正式发布
npm publish

# 发布 beta 版本
npm publish --tag beta

# 发布到私有仓库
npm publish --registry https://your-registry.com

# 查看将要发布的文件（不实际发布）
npm publish --dry-run
```

### 步骤 4：验证发布

```bash
# 查看发布的包
npm view figma-to-rn-toolkit

# 测试安装
npm install figma-to-rn-toolkit

# 访问 NPM 页面
# https://www.npmjs.com/package/figma-to-rn-toolkit
```

---

## 🔢 版本管理策略

### 语义化版本控制 (Semantic Versioning)

版本格式：`主版本号.次版本号.修订号`

- **主版本号 (Major)**: 不兼容的 API 修改
- **次版本号 (Minor)**: 向下兼容的功能性新增
- **修订号 (Patch)**: 向下兼容的问题修正

### 版本号更新规则

| 变更类型 | 命令 | 示例 | 使用场景 |
|---------|------|------|---------|
| Patch | `npm version patch` | 1.0.0 → 1.0.1 | Bug 修复、小改动 |
| Minor | `npm version minor` | 1.0.0 → 1.1.0 | 新功能、向后兼容 |
| Major | `npm version major` | 1.0.0 → 2.0.0 | 重大变更、不兼容 |
| Pre-release | `npm version prerelease` | 1.0.0 → 1.0.1-0 | 预发布版本 |

### 预发布版本

```bash
# Alpha 版本
npm version 1.0.0-alpha.1
npm publish --tag alpha

# Beta 版本
npm version 1.0.0-beta.1
npm publish --tag beta

# RC 版本
npm version 1.0.0-rc.1
npm publish --tag rc
```

---

## ❓ 常见问题解决

### 快速故障排除

#### 问题：未登录 NPM
```bash
npm login
```

#### 问题：包名已存在
- 修改 package.json 中的 name 字段
- 或使用作用域包名：`@username/package-name`

#### 问题：构建失败
```bash
npm install
npm run build
```

#### 问题：权限不足
- Windows：以管理员身份运行
- Mac/Linux：使用 `sudo`

### 详细问题解决

#### 1. 登录失败

```bash
# 错误：npm ERR! 401 Unauthorized
# 解决方案：
npm logout
npm login
```

#### 2. 包名已存在

```bash
# 错误：npm ERR! 403 Forbidden - Package name already exists
# 解决方案：
# 1. 更改包名
# 2. 使用作用域包名：@username/package-name
```

#### 3. 版本号冲突

```bash
# 错误：npm ERR! 403 Forbidden - version already exists
# 解决方案：
npm version patch  # 增加版本号
npm publish
```

#### 4. 文件过大

```bash
# 错误：npm ERR! 413 Payload Too Large
# 解决方案：
# 1. 检查 .npmignore，排除不必要的文件
# 2. 使用 npm pack 查看包大小
npm pack --dry-run
```

#### 5. 网络问题

```bash
# 使用淘宝镜像登录和发布
npm login --registry https://registry.npmjs.org
npm publish --registry https://registry.npmjs.org
```

#### 6. 权限问题

```bash
# 错误：npm ERR! 403 Forbidden - You do not have permission
# 解决方案：
# 1. 确认是包的所有者或协作者
# 2. 添加协作者：
npm owner add username package-name
```

---

## 📋 最佳实践

### 发布前检查清单

- [ ] 代码已测试
- [ ] 文档已更新
- [ ] 版本号已更新
- [ ] CHANGELOG 已更新
- [ ] 示例代码可运行
- [ ] 依赖版本正确
- [ ] 无敏感信息泄露
- [ ] LICENSE 文件存在
- [ ] README 内容完整

### 安全建议

1. **启用双因素认证 (2FA)**
   ```bash
   npm profile enable-2fa auth-and-writes
   ```

2. **使用发布令牌**
   ```bash
   npm token create --read-only=false
   ```

3. **定期更新依赖**
   ```bash
   npm audit
   npm audit fix
   ```

### 自动化配置

#### GitHub Actions 自动发布

创建 `.github/workflows/npm-publish.yml`:

```yaml
name: NPM Publish

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

### 包的维护

1. **定期更新**
   - 修复 bug
   - 更新依赖
   - 改进文档

2. **版本废弃**
   ```bash
   npm deprecate package-name@version "废弃信息"
   ```

3. **撤销发布**（24小时内）
   ```bash
   npm unpublish package-name@version
   ```

---

## 🎉 发布成功后

1. **查看发布的包**
   ```
   https://www.npmjs.com/package/figma-to-rn-toolkit
   ```

2. **测试安装**
   ```bash
   npm install figma-to-rn-toolkit
   ```

3. **创建 Git 标签**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. **通知用户**
   - 更新项目 README
   - 发布 Release Notes
   - 社交媒体宣传

5. **监控反馈**
   - GitHub Issues
   - NPM 下载统计
   - 用户反馈

6. **持续维护**
   - 及时修复 bug
   - 响应用户问题
   - 定期更新文档

---

## 🔧 快速命令参考

```bash
# 登录相关
npm login                          # 登录
npm logout                         # 登出
npm whoami                         # 查看当前用户

# 包信息
npm view package-name              # 查看包信息
npm search keyword                 # 搜索包
npm ls package-name                # 查看已安装的包

# 版本管理
npm version patch                  # 补丁版本
npm version minor                  # 次要版本
npm version major                  # 主要版本
npm version prerelease             # 预发布版本

# 发布相关
npm publish                        # 发布
npm publish --tag beta             # 发布 beta 版本
npm publish --dry-run              # 模拟发布
npm unpublish package@version      # 撤销发布

# 权限管理
npm owner ls package-name          # 查看包的所有者
npm owner add username package     # 添加所有者
npm owner rm username package      # 移除所有者

# 标签管理
npm dist-tag ls package-name       # 查看标签
npm dist-tag add package@ver tag   # 添加标签
npm dist-tag rm package tag        # 删除标签
```

---

## 📞 获取帮助

- NPM 官方文档：[https://docs.npmjs.com](https://docs.npmjs.com)
- NPM 状态页面：[https://status.npmjs.org](https://status.npmjs.org)
- NPM 支持：[https://www.npmjs.com/support](https://www.npmjs.com/support)
- 社区论坛：[https://npm.community](https://npm.community)

---

**祝您发布顺利！** 🚀
