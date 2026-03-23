# figma-to-rn-toolkit NPM 发布指南

本指南提供了手动和自动化两种方法来发布 figma-to-rn-toolkit 到 npm，包括用于简化发布工作流程的高级自动化发布系统。

## 目录

- [前置要求](#前置要求)
- [自动化发布系统（推荐）](#自动化发布系统推荐)
- [手动发布步骤](#手动发布步骤)
- [版本管理](#版本管理)
- [故障排除](#故障排除)
- [最佳实践](#最佳实践)
- [安全注意事项](#安全注意事项)
- [维护](#维护)

## 前置要求

1. **Node.js**: >= 16.0.0
2. **npm**: >= 8.0.0
3. **npm 账户**: 在 [npmjs.com](https://npmjs.com) 创建账户
4. **Git**: 用于版本控制和仓库管理
5. **Git 远程仓库**: 正确配置并具有推送权限

---

## 自动化发布系统（推荐）

本项目包含一个完整的自动化发布脚本 (`scripts/release.js`)，可处理版本管理、构建、测试、Git 操作和 NPM 发布，具有高级错误处理和回滚功能。

### 功能特性

- **交互式版本选择** - 在 patch、minor 或 major 发布之间选择
- **全面的预检查** - Git 状态、NPM 认证、依赖项、网络连接
- **自动构建和测试** - 清理、ESLint 检查、TypeScript 编译、Jest 测试
- **包验证** - 发布前确保包的完整性
- **Git 操作** - 自动提交、打标签和推送
- **NPM 发布** - 发布到 registry 并验证
- **错误处理** - 失败时的回滚功能
- **详细日志** - 完整的发布过程审计记录 (`release.log`)
- **试运行模式** - 在不进行实际更改的情况下测试流程

### 快速开始

#### 交互式发布（推荐）

```bash
npm run release
```

这将：
1. 运行所有预检查（Git 状态、NPM 认证、依赖、网络）
2. 清理并重新构建项目 (tsc -> dist/)
3. ESLint 检查（自动尝试修复）
4. Jest 测试执行
5. 包完整性验证 (npm pack --dry-run)
6. 提示选择版本类型（patch/minor/major）
7. 显示版本变更并询问确认
8. 处理所有 Git 操作（commit、tag、push）
9. 发布到 NPM 并验证

#### 自动化发布命令

```bash
# 试运行模式（无实际更改）
npm run release:dry

# 直接版本发布
npm run release:patch-auto    # Patch 版本 (1.5.0 -> 1.5.1)
npm run release:minor-auto    # Minor 版本 (1.5.0 -> 1.6.0)
npm run release:major-auto    # Major 版本 (1.5.0 -> 2.0.0)
```

#### 高级选项

```bash
node scripts/release.js [options]

Options:
  --dry-run, -d     试运行模式（无实际更改）
  --version, -v     指定版本类型 (patch|minor|major)
  --skip-tests, -s  跳过测试执行
  --help, -h        显示帮助信息
```

#### 示例

```bash
# 试运行的交互式发布
node scripts/release.js --dry-run

# 自动化 patch 发布
node scripts/release.js --version patch

# 跳过测试的 minor 发布
node scripts/release.js --version minor --skip-tests

# 跳过测试的 major 版本试运行
node scripts/release.js -d -v major -s
```

### 流程概览

#### 1. 预检查
- Git 工作树状态（警告未提交的更改）
- 当前 Git 分支验证（推荐 main/master）
- NPM 认证状态
- 依赖项安装
- 到 NPM registry 的网络连接

#### 2. 构建和测试
- 清理之前的构建产物 (rimraf dist/)
- ESLint 代码质量检查（尝试自动修复）
- TypeScript 编译 (tsc -> dist/)
- Jest 测试执行（如果未跳过）
- 包完整性验证 (npm pack --dry-run)

#### 3. 版本管理
- 显示当前版本
- 交互式或自动化版本类型选择
- 计算并预览新版本
- 用户确认版本更新
- 更新 package.json

#### 4. Git 操作
- 提交版本更改 (`chore: release vX.Y.Z`)
- 创建版本标签（vX.Y.Z 格式）
- 推送提交和标签到远程

#### 5. NPM 发布
- 发布包到 NPM registry
- 等待 registry 传播（5 秒）
- 验证发布成功

### 错误处理和回滚

自动化脚本包含全面的错误处理：

- **失败时自动回滚**（尽可能）
- **版本回滚** - 恢复 package.json 更改
- **Git 回滚** - 删除提交和标签
- **详细错误日志** - `release.log` 中的完整审计记录
- **优雅失败** - 带有有用错误信息的干净退出

### 日志记录

所有发布操作都记录到 `release.log`，包含：
- 所有操作的时间戳
- 逐步执行详情
- 错误信息和堆栈跟踪
- 发布持续时间和摘要

### 旧版脚本

旧版发布脚本仍然可用：

```bash
# 旧版交互式发布
node publish-to-npm.js

# 旧版预发布检查
node pre-publish-check.js

# 旧版直接发布
npm run publish:patch    # npm version patch && npm publish
npm run publish:minor    # npm version minor && npm publish
npm run publish:major    # npm version major && npm publish
```

推荐使用新的自动化脚本 (`npm run release`)，因为它包含全面的检查和更好的错误处理。

---

## 手动发布步骤

### 发布前检查清单

#### 1. 验证包配置

检查 `package.json` 关键字段：

```json
{
  "name": "figma-to-rn-toolkit",
  "version": "1.5.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "src",
    ".cursor/rules/figma-design-system.mdc",
    "examples",
    "README.md",
    "README_en.md",
    "README_zh.md",
    "LICENSE"
  ]
}
```

#### 2. 构建和测试包

```bash
cd D:\work\RN\figma-to-rn-toolkit

npm install
npm run build
npm test
```

#### 3. 本地测试包

```bash
npm pack
# 生成 figma-to-rn-toolkit-X.Y.Z.tgz
# 在测试项目中安装: npm install ./figma-to-rn-toolkit-X.Y.Z.tgz
```

### 发布步骤

```bash
# 1. 登录 npm
npm login

# 2. 验证登录
npm whoami

# 3. 预检查
npm pack --dry-run
npm run lint
npm test

# 4. 更新版本并发布
npm version patch   # 或 minor / major
npm publish

# 5. 验证
# 访问 https://npmjs.com/package/figma-to-rn-toolkit
```

### 发布后任务

```bash
# Git 标签和推送
git push origin main --tags

# 验证安装
npm install figma-to-rn-toolkit@latest
```

---

## 版本管理

### 语义化版本（SemVer）

- **Major** (1.0.0 -> 2.0.0): 破坏性变更（API 不兼容）
- **Minor** (1.0.0 -> 1.1.0): 新功能，向后兼容
- **Patch** (1.0.0 -> 1.0.1): Bug 修复，向后兼容

### 可用脚本

```json
{
  "scripts": {
    "release": "node scripts/release.js",
    "release:dry": "node scripts/release.js --dry-run",
    "release:patch-auto": "node scripts/release.js --version patch",
    "release:minor-auto": "node scripts/release.js --version minor",
    "release:major-auto": "node scripts/release.js --version major",
    "publish:patch": "npm version patch && npm publish",
    "publish:minor": "npm version minor && npm publish",
    "publish:major": "npm version major && npm publish"
  }
}
```

---

## 故障排除

### 常见问题和解决方案

#### NPM 认证问题
```bash
npm login
npm whoami
```

#### Git 工作树问题
```bash
git status
git add . && git commit -m "pre-release commit"
npm run release:dry
```

#### 构建问题
```bash
npm run build
npm run lint
```

#### 网络问题
```bash
npm ping
```

#### 包名已存在
解决方案：更新版本号 `npm version patch`

#### 版本已发布
解决方案：`npm version patch` 更新版本号后重新发布

### 手动推送和发布

当自动化发布遇到网络问题或 Git 推送失败时：

#### 方法 1：使用 Git Bash 手动推送

```bash
git push origin main
git push origin v1.5.1
npm publish
```

#### 方法 2：使用代理解决网络问题

```bash
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

git push origin main
git push origin v1.5.1

git config --global --unset http.proxy
git config --global --unset https.proxy
```

#### 方法 3：使用 SSH 代替 HTTPS

```bash
git remote set-url origin git@github.com:figma-to-rn-toolkit/figma-to-rn-toolkit.git
git push origin main
git push origin v1.5.1
npm publish
```

### 手动发布恢复

如果需要回滚失败的发布：

```bash
git tag -d v1.5.1
git reset --hard HEAD~1
# 手动编辑 package.json 恢复版本号
```

### 获取帮助

```bash
node scripts/release.js --help
# 或查看日志
cat release.log
```

---

## 最佳实践

### 开发工作流程
1. 始终先测试 - 使用 `npm run release:dry` 验证流程
2. 干净的工作树 - 发布前提交更改
3. 审查更改 - 使用 `npm pack --dry-run` 检查将发布的内容
4. 监控发布 - 验证包出现在 npmjs.com 上
5. 保留日志 - 查看 `release.log` 中的任何警告或问题

### 版本管理
6. 使用语义化版本 - 遵循 semver 版本选择指南
7. 标记发布 - 使用 Git 标签进行版本管理
8. 更新文档 - 保持 README 和 CHANGELOG 最新

### 测试和质量
9. 发布前始终测试 - 使用 `npm pack` 并本地测试
10. 保持 .npmignore 更新 - 不要发布不必要的文件
11. 写好提交信息 - 用于版本跟踪

### 自动化
12. 首选自动化发布 - 使用 `npm run release` 保持一致性
13. 使用试运行模式 - 执行前测试发布
14. 审查自动化日志 - 检查 `release.log` 中的问题

---

## 安全注意事项

### 账户安全
1. **启用 2FA** - 使用双因素认证保护 npm 账户
2. **使用自动化令牌** - 在 CI/CD 管道中使用令牌而非密码
3. **作用域包** - 考虑使用作用域包（@yourname/package）

### NPM 自动化令牌配置（绕过 2FA）

要启用完全自动化的发布而无需每次进行 2FA 验证：

#### 步骤 1：创建细粒度访问令牌

1. 访问 https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. 点击 **"Generate New Token"** -> **"Granular Access Token"**

#### 步骤 2：配置令牌设置

| 设置 | 推荐值 |
|------|--------|
| Token name | `auto-publish` |
| Bypass two-factor authentication (2FA) | 必须勾选 |
| Permissions | `Read and write` |
| Select packages | `All packages` 或特定包 |
| Expiration Date | 设置合理的过期时间（如 1 年） |

#### 步骤 3：在系统中配置令牌

```bash
# 全局配置（推荐）
npm config set //registry.npmjs.org/:_authToken=npm_YOUR_TOKEN_HERE
```

#### 步骤 4：验证

```bash
npm whoami
```

### 代码安全
4. **审查依赖** - 定期审计依赖项的漏洞
5. **永不暴露凭据** - 脚本永不暴露 NPM 凭据
6. **使用试运行验证** - 所有操作都可以在试运行模式下审查

---

## 维护

### 定期任务

1. **更新依赖** - 保持依赖项最新
2. **监控问题** - 回应 GitHub issues 和 npm 反馈
3. **安全更新** - 及时处理安全漏洞
4. **文档** - 随新功能更新文档
5. **审查自动化** - 定期检查发布脚本性能

### 废弃流程

```bash
# 废弃特定版本
npm deprecate figma-to-rn-toolkit@1.0.0 "此版本存在安全漏洞"

# 废弃所有版本
npm deprecate figma-to-rn-toolkit "包不再维护"
```

---

## 快速参考

### 最常用命令

```bash
# 自动化发布（推荐）
npm run release

# 测试发布流程
npm run release:dry

# 快速 patch 发布
npm run release:patch-auto

# 手动发布
npm version patch
npm publish

# 获取帮助
node scripts/release.js --help
```

---

## 成功检查清单

- [ ] 包构建成功（`npm run build`）
- [ ] 所有文件包含在构建中（`npm pack --dry-run`）
- [ ] README 内容完整
- [ ] 版本号正确
- [ ] Git 仓库干净并已打标签
- [ ] npm 登录成功（`npm whoami`）
- [ ] 包发布成功
- [ ] 安装测试通过（`npm install figma-to-rn-toolkit`）
- [ ] 文档链接有效
- [ ] 自动化脚本已测试（`npm run release:dry`）
