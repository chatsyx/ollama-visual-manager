# Ollama Visual Manager

跨平台Ollama可视化管理工具 - v1.1版本

## 项目描述

Ollama Visual Manager是一个功能强大的跨平台工具，用于可视化管理和使用Ollama模型。它提供了直观的用户界面，使您能够轻松地管理模型、进行对话、监控资源使用情况以及调试API接口。

## 功能特性

- **跨平台兼容性**：支持Windows、macOS和Linux
- **直观的用户界面**：基于React和Electron的现代化前端
- **模型管理**：轻松拉取、列出和删除Ollama模型
- **对话界面**：与模型进行交互式对话，支持历史记录
- **资源监控**：实时监控CPU、内存和GPU使用率
- **API调试**：方便地测试和调试Ollama API
- **离线功能**：支持在没有网络连接的情况下使用
- **本地存储**：使用SQLite数据库存储聊天历史
- **大小优化**：应用体积控制在50MB以内
- **自动化测试**：包含单元测试确保代码质量
- **CI/CD集成**：使用GitHub Actions实现自动化构建和测试

## 技术栈

- **前端**：React + Electron + Vite
- **后端**：FastAPI (Python)
- **存储**：SQLite
- **构建工具**：electron-builder
- **测试框架**：Jest

## 安装和使用

### 开发模式

1. **克隆仓库**
   ```bash
   git clone https://github.com/chatsyx/ollama-visual-manager.git
   cd ollama-visual-manager
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动前端**
   ```bash
   npm run dev
   ```

4. **启动后端**
   ```bash
   # Windows PowerShell
   cd backend ; python app.py
   
   # macOS/Linux
   cd backend && python app.py
   ```

### 生产构建

1. **构建前端**
   ```bash
   npm run build
   ```

2. **打包应用**
   ```bash
   npm run electron-build
   ```

3. **运行应用**
   - 构建完成后，可执行文件将位于 `build-release-new/win-unpacked/` 目录中
   - 双击 `Ollama Visual Manager.exe` 启动应用

## 目录结构

```
ollama-visual-manager/
├── .github/           # GitHub Actions CI/CD配置
├── backend/           # FastAPI后端代码
│   ├── app.py         # 主后端应用
│   ├── requirements.txt
│   └── test_app.py
├── build/             # 前端构建输出
├── build-release-new/ # 应用打包输出
├── scripts/           # 构建脚本
├── src/               # 前端源代码
│   ├── components/    # React组件
│   ├── App.jsx        # 主应用组件
│   └── main.jsx       # 入口文件
├── .gitignore         # Git忽略文件
├── LICENSE            # 许可证文件
├── README.md          # 项目说明
├── TESTING.md         # 测试说明
├── index.html         # 前端入口HTML
├── main.js            # Electron主进程
├── package.json       # 项目配置
├── preload.js         # Electron预加载脚本
└── vite.config.js     # Vite配置
```

## 贡献指南

1. **Fork仓库**
2. **创建特性分支**：`git checkout -b feature/your-feature`
3. **提交更改**：`git commit -m 'Add some feature'`
4. **推送到分支**：`git push origin feature/your-feature`
5. **创建Pull Request**

## 许可证

本项目采用MIT许可证 - 详情请参阅 [LICENSE](LICENSE) 文件

## 联系方式

- 项目地址：[https://github.com/chatsyx/ollama-visual-manager](https://github.com/chatsyx/ollama-visual-manager)
- 作者：chatsyx

## 更新日志

### v1.1 (2026-01-28)
- 优化了后端代码结构和错误处理
- 更新了版本号和依赖项
- 改进了README.md文档
- 修复了构建和打包过程中的问题
- 增强了应用的稳定性和性能

### v1.0 (2026-01-27)
- 初始版本发布
- 实现了基本的模型管理和对话功能
- 添加了资源监控和API调试功能
- 支持跨平台打包
