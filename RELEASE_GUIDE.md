# Ollama Visual Manager v1.1 发布指南

本指南将帮助您完成Ollama Visual Manager v1.1版本的发布过程，包括解决文件占用问题、运行打包命令、将打包好的文件上传到GitHub等步骤。

## 1. 准备工作

### 1.1 检查项目状态

首先，确保您的项目代码已经完成所有必要的更改，并且已经提交到GitHub。

### 1.2 终止可能占用文件的进程

在运行打包命令之前，您需要终止所有可能占用文件的进程：

```powershell
# 终止Ollama Visual Manager进程
try {
    Get-Process "Ollama Visual Manager" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "Ollama Visual Manager进程已终止"
} catch {
    Write-Host "没有找到Ollama Visual Manager进程"
}

# 终止占用端口8000的进程
$port = 8000
$processes = netstat -ano | Select-String ":$port "
if ($processes) {
    $pid = $processes[0].ToString().Split(' ')[-1].Trim()
    Write-Host "终止占用端口8000的进程(PID: $pid)..."
    try {
        Stop-Process -Id $pid -Force
        Write-Host "进程已终止"
    } catch {
        Write-Host "无法终止进程: $($_.Exception.Message)"
    }
}

# 终止可能的electron进程
try {
    Get-Process "electron" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "Electron进程已终止"
} catch {
    Write-Host "没有找到Electron进程"
}
```

### 1.3 删除可能导致冲突的目录

删除可能导致冲突的目录，确保打包过程能够顺利进行：

```powershell
# 删除可能导致冲突的目录
Remove-Item -Path "build-release-new" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "release" -Recurse -Force -ErrorAction SilentlyContinue
```

## 2. 构建和打包

### 2.1 构建前端

运行以下命令构建前端应用：

```powershell
# 构建前端
npm run build
```

### 2.2 打包应用

运行以下命令打包应用：

```powershell
# 打包应用
npm run electron-build
```

### 2.3 检查打包结果

打包完成后，检查打包结果，确保生成了可执行文件：

```powershell
# 检查打包结果
if (Test-Path "build-release-new") {
    $exeFiles = Get-ChildItem "build-release-new" -Recurse -File | Where-Object {$_.Extension -eq ".exe"}
    if ($exeFiles.Count -gt 0) {
        Write-Host "找到以下可执行文件:"
        $exeFiles | Select-Object Name, FullName
    } else {
        Write-Host "没有找到可执行文件，请检查打包过程是否成功。"
    }
} else {
    Write-Host "打包目录不存在，请检查打包过程是否成功。"
}
```

## 3. 发布到GitHub

### 3.1 准备发布文件

将打包好的文件复制到一个新的目录，准备上传到GitHub：

```powershell
# 创建上传目录
New-Item -ItemType Directory -Path "release-upload" -ErrorAction SilentlyContinue

# 复制打包文件
if (Test-Path "build-release-new") {
    $exeFiles = Get-ChildItem "build-release-new" -Recurse -File | Where-Object {$_.Extension -eq ".exe"}
    $exeFiles | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination "release-upload" -Force
    }
    Write-Host "打包文件已复制到release-upload目录。"
}
```

### 3.2 创建GitHub Release

登录GitHub，在仓库页面创建一个新的Release：

1. 打开 https://github.com/chatsyx/ollama-visual-manager/releases
2. 点击 "Draft a new release"
3. 填写以下信息：
   - **Tag version**: `v1.1`
   - **Release title**: `Ollama Visual Manager v1.1`
   - **Description**: 填写发布说明，可参考以下内容：
     ```
     ## Ollama Visual Manager v1.1

     ### 主要更新：
     - 优化了后端代码结构，改进了错误处理
     - 更新了README.md文档，添加了详细的项目描述和使用说明
     - 配置了GitHub Actions CI/CD流程
     - 修复了构建和打包过程中的问题
     - 增强了应用的稳定性和性能

     ### 功能特性：
     - 跨平台兼容性（Windows/macOS/Linux）
     - 直观的用户界面
     - 模型管理功能
     - 对话界面
     - 资源监控
     - API调试
     - 离线功能支持
     - SQLite本地存储
     ```
4. 点击 "Attach binaries by dropping them here or selecting them" 上传打包好的可执行文件
5. 从 `release-upload` 目录中选择可执行文件并上传
6. 点击 "Publish release" 完成发布

## 4. 故障排除

### 4.1 文件占用问题

如果遇到文件占用问题，尝试以下解决方案：

1. 重新启动计算机，确保所有进程都已终止
2. 使用Process Explorer工具查找并终止占用文件的进程
3. 修改package.json文件，更改输出目录：
   ```powershell
   $packageJsonPath = "package.json"
   $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
   $packageJson.build.directories.output = "build-release-v1.1-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
   $packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath
   ```

### 4.2 打包命令失败

如果打包命令失败，尝试以下解决方案：

1. 确保所有依赖项都已正确安装：
   ```powershell
   npm install
   ```
2. 尝试使用不同的打包命令：
   ```powershell
   # 只生成未打包的目录版本
   npm run electron-build-dir
   ```
3. 检查electron-builder的配置文件，确保配置正确

## 5. 完成发布

发布完成后，您可以在GitHub上查看发布结果，确保所有文件都已正确上传，并且发布信息完整。

您还可以在GitHub Actions页面查看CI/CD的运行状态，确保构建和测试过程都已成功完成。

---

**发布完成！** 现在，用户可以从GitHub上下载Ollama Visual Manager v1.1版本的安装包，开始使用这个功能强大的跨平台Ollama可视化管理工具。