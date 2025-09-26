#!/usr/bin/env node

/**
 * Automated NPM publish script for figma-to-rn-toolkit
 * 一键发布到 NPM 的自动化脚本
 */

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const chalk = {
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    cyan: (text) => `\x1b[36m${text}\x1b[0m`,
    bold: (text) => `\x1b[1m${text}\x1b[0m`
};

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function execCommand(command, silent = false) {
    try {
        const result = execSync(command, {
            encoding: 'utf8',
            stdio: silent ? 'pipe' : 'inherit'
        });
        return { success: true, output: result };
    } catch (error) {
        return { success: false, error };
    }
}

async function main() {
    console.log(chalk.cyan(chalk.bold('======================================')));
    console.log(chalk.cyan(chalk.bold('NPM 一键发布脚本')));
    console.log(chalk.cyan(chalk.bold('NPM One-Click Publish Script')));
    console.log(chalk.cyan(chalk.bold('======================================')));
    console.log();

    // Step 1: Run pre-publish checks
    console.log(chalk.bold('步骤 1: 运行发布前检查...'));
    const checkResult = execCommand('node pre-publish-check.js', true);
    if (!checkResult.success) {
        console.log(chalk.red('✗ 发布前检查失败，请修复上述问题后重试'));
        rl.close();
        process.exit(1);
    }
    console.log(chalk.green('✓ 发布前检查通过'));

    // Step 2: Check NPM login status
    console.log(chalk.bold('\n步骤 2: 检查 NPM 登录状态...'));
    const whoamiResult = execCommand('npm whoami', true);
    if (!whoamiResult.success) {
        console.log(chalk.yellow('您尚未登录 NPM'));
        console.log('请运行以下命令登录：');
        console.log(chalk.cyan('  npm login'));
        console.log();

        const loginAnswer = await question('是否现在登录？(y/n): ');
        if (loginAnswer.toLowerCase() === 'y') {
            console.log('请按照提示完成登录...');
            execCommand('npm login');

            // Re-check login status
            const recheckResult = execCommand('npm whoami', true);
            if (!recheckResult.success) {
                console.log(chalk.red('✗ 登录失败，请手动登录后重试'));
                rl.close();
                process.exit(1);
            }
        } else {
            console.log(chalk.red('✗ 未登录，发布已取消'));
            rl.close();
            process.exit(1);
        }
    }
    const npmUser = whoamiResult.output?.trim() || 'unknown';
    console.log(chalk.green(`✓ 已登录为: ${npmUser}`));

    // Step 3: Clean and rebuild
    console.log(chalk.bold('\n步骤 3: 清理并重新构建...'));
    console.log('清理旧的构建文件...');
    execCommand('npm run prebuild', true);
    console.log('重新构建项目...');
    const buildResult = execCommand('npm run build');
    if (!buildResult.success) {
        console.log(chalk.red('✗ 构建失败'));
        rl.close();
        process.exit(1);
    }
    console.log(chalk.green('✓ 构建成功'));

    // Step 4: Run tests
    console.log(chalk.bold('\n步骤 4: 运行测试...'));
    const testResult = execCommand('npm test', true);
    if (!testResult.success) {
        console.log(chalk.yellow('⚠ 测试失败或未配置'));
        const continueAnswer = await question('测试未通过，是否继续发布？(y/n): ');
        if (continueAnswer.toLowerCase() !== 'y') {
            console.log(chalk.red('✗ 发布已取消'));
            rl.close();
            process.exit(1);
        }
    } else {
        console.log(chalk.green('✓ 测试通过'));
    }

    // Step 5: Check and update version
    console.log(chalk.bold('\n步骤 5: 版本管理...'));
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    console.log(`当前版本: ${chalk.cyan(packageJson.version)}`);
    console.log('版本号规则:');
    console.log('  - patch (补丁): 1.0.0 -> 1.0.1 (bug修复)');
    console.log('  - minor (次要): 1.0.0 -> 1.1.0 (新功能)');
    console.log('  - major (主要): 1.0.0 -> 2.0.0 (重大变更)');

    const versionType = await question('选择版本更新类型 (patch/minor/major) [patch]: ');
    const selectedType = versionType || 'patch';

    if (['patch', 'minor', 'major'].includes(selectedType)) {
        console.log(`更新版本 (${selectedType})...`);
        const versionResult = execCommand(`npm version ${selectedType}`);
        if (!versionResult.success) {
            console.log(chalk.red('✗ 版本更新失败'));
            rl.close();
            process.exit(1);
        }
        const newPackageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        console.log(chalk.green(`✓ 版本已更新至: ${newPackageJson.version}`));
    } else {
        console.log(chalk.yellow('跳过版本更新'));
    }

    // Step 6: Git commit (if applicable)
    console.log(chalk.bold('\n步骤 6: Git 提交...'));
    const gitStatusResult = execCommand('git status --porcelain', true);
    if (gitStatusResult.output && gitStatusResult.output.trim()) {
        const commitAnswer = await question('检测到未提交的更改，是否提交？(y/n): ');
        if (commitAnswer.toLowerCase() === 'y') {
            execCommand('git add .');
            const commitMessage = await question('请输入提交信息: ');
            execCommand(`git commit -m "${commitMessage || 'Prepare for npm publish'}"`);
            console.log(chalk.green('✓ 代码已提交'));
        }
    } else {
        console.log(chalk.green('✓ 没有需要提交的更改'));
    }

    // Step 7: Preview what will be published
    console.log(chalk.bold('\n步骤 7: 预览发布内容...'));
    console.log('将要发布的文件:');
    const dryRunResult = execCommand('npm pack --dry-run', true);
    if (dryRunResult.success && dryRunResult.output) {
        const lines = dryRunResult.output.split('\n').slice(0, -3); // Remove summary lines
        lines.forEach(line => {
            if (line.includes('npm notice')) {
                console.log('  ' + line.replace('npm notice', '').trim());
            }
        });
    }

    // Step 8: Final confirmation
    console.log(chalk.bold('\n步骤 8: 最终确认...'));
    const updatedPackageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    console.log(chalk.cyan('即将发布:'));
    console.log(`  包名: ${chalk.bold(updatedPackageJson.name)}`);
    console.log(`  版本: ${chalk.bold(updatedPackageJson.version)}`);
    console.log(`  用户: ${chalk.bold(npmUser)}`);
    console.log();

    const confirmAnswer = await question(chalk.yellow('确认发布到 NPM？(yes/no): '));
    if (confirmAnswer.toLowerCase() !== 'yes') {
        console.log(chalk.red('✗ 发布已取消'));
        rl.close();
        process.exit(0);
    }

    // Step 9: Publish to NPM
    console.log(chalk.bold('\n步骤 9: 发布到 NPM...'));
    console.log('正在发布，请稍候...');

    const publishResult = execCommand('npm publish');
    if (!publishResult.success) {
        console.log(chalk.red('✗ 发布失败'));
        console.log('可能的原因:');
        console.log('  1. 包名已存在');
        console.log('  2. 版本号冲突');
        console.log('  3. 网络连接问题');
        console.log('  4. 权限不足');
        rl.close();
        process.exit(1);
    }

    // Step 10: Success!
    console.log();
    console.log(chalk.green(chalk.bold('======================================')));
    console.log(chalk.green(chalk.bold('🎉 发布成功！')));
    console.log(chalk.green(chalk.bold('======================================')));
    console.log();
    console.log(`包已发布: ${chalk.cyan(updatedPackageJson.name)}@${chalk.cyan(updatedPackageJson.version)}`);
    console.log();
    console.log('查看发布的包:');
    console.log(`  ${chalk.cyan(`https://www.npmjs.com/package/${updatedPackageJson.name}`)}`);
    console.log();
    console.log('安装命令:');
    console.log(`  ${chalk.cyan(`npm install ${updatedPackageJson.name}`)}`);
    console.log(`  ${chalk.cyan(`npm install ${updatedPackageJson.name}@${updatedPackageJson.version}`)}`);

    // Step 11: Git tag and push (optional)
    console.log(chalk.bold('\n步骤 11: Git 标签...'));
    const tagAnswer = await question('是否创建并推送 Git 标签？(y/n): ');
    if (tagAnswer.toLowerCase() === 'y') {
        const tagName = `v${updatedPackageJson.version}`;
        execCommand(`git tag ${tagName}`);
        execCommand(`git push origin ${tagName}`);
        console.log(chalk.green(`✓ Git 标签 ${tagName} 已创建并推送`));
    }

    console.log();
    console.log(chalk.green('✨ 全部完成！'));
    rl.close();
}

// Handle errors
process.on('unhandledRejection', (error) => {
    console.error(chalk.red('发生错误:'), error);
    rl.close();
    process.exit(1);
});

// Run the script
main().catch(error => {
    console.error(chalk.red('发生错误:'), error);
    rl.close();
    process.exit(1);
});