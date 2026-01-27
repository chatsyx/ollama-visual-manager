# Ollama Visual Manager

跨平台Ollama可视化管理工具，基于React+Electron前端和FastAPI后端，提供直观的图形界面来管理Ollama模型和进行对话。

## 功能特性

### 🔧 模型管理
- 一键拉取新模型
- 模型删除和重命名
- 已安装模型列表查询

### 💬 对话功能
- 多模型同时对话
- 支持不同模型切换
- 对话历史本地SQLite存储

### 📊 资源监控
- GPU使用率实时监控
- CPU使用率实时监控
- 内存使用率实时监控

### 🔍 API调试
- 支持Ollama API参数自定义
- 可视化API请求构建
- 响应结果实时查看

### 📤 对话导出
- Markdown格式导出
- JSON格式导出

## 技术栈

- **前端**: React + Electron
- **后端**: FastAPI
- **数据库**: SQLite
- **资源监控**: psutil
- **构建工具**: Vite

## 安装指南

### 前提条件

- Node.js 16+
- Python 3.8+
- Ollama 已安装并运行

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/yourusername/ollama-visual-manager.git
cd ollama-visual-manager
```

2. **安装前端依赖**

```bash
npm install
```

3. **安装后端依赖**

```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 运行项目

#### 开发模式

1. **启动后端服务**

```bash
cd backend
python app.py
```

2. **启动前端开发服务器**

```bash
npm run dev
```

3. **启动Electron应用**

```bash
npm start
```

#### 生产模式

1. **构建前端**

```bash
npm run build
```

2. **打包应用**

```bash
npm run electron-build
```

## 跨平台支持

- ✅ Windows
- ✅ macOS
- ✅ Linux

## 配置文件

应用设置存储在 `localStorage` 中，主要配置项包括：

- **Ollama API地址**: 默认 `http://localhost:11434`
- **数据库路径**: 默认 `./chat-history.db`
- **主题**: 浅色/深色

## 项目结构

```
ollama-visual-manager/
├── backend/              # FastAPI后端
│   ├── app.py            # 主应用入口
│   └── requirements.txt  # Python依赖
├── src/                  # React前端
│   ├── components/       # 前端组件
│   ├── App.jsx           # 主应用组件
│   └── main.jsx          # 前端入口
├── main.js               # Electron主进程
├── preload.js            # Electron预加载脚本
├── package.json          # 前端依赖和脚本
├── vite.config.js        # Vite配置
└── README.md             # 项目说明
```

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件

## 贡献指南

欢迎贡献代码、报告问题或提出功能建议！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 故障排除

### 常见问题

1. **无法连接到Ollama API**
   - 确保Ollama服务已启动
   - 检查Ollama API地址配置是否正确

2. **模型拉取失败**
   - 确保网络连接正常
   - 检查模型名称是否正确

3. **资源监控显示为0**
   - 确保psutil库已正确安装
   - GPU监控需要安装GPUtil库

### 日志

- 前端日志: 可在Electron开发者工具中查看
- 后端日志: 运行后端服务时在终端中查看

## 联系方式

- 项目链接: [https://github.com/yourusername/ollama-visual-manager](https://github.com/yourusername/ollama-visual-manager)
- 问题反馈: [https://github.com/yourusername/ollama-visual-manager/issues](https://github.com/yourusername/ollama-visual-manager/issues)

---

**享受使用 Ollama Visual Manager！** 🎉
