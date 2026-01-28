"""
Ollama Visual Manager 后端服务
V1.1版本
提供与Ollama模型的交互接口
作者：chatsyx
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import json
import subprocess
import psutil
import os

# 创建FastAPI应用实例
app = FastAPI(
    title="Ollama Visual Manager API",
    description="提供与Ollama模型的交互接口",
    version="1.1",
    contact={
        "name": "chatsyx",
        "url": "https://github.com/chatsyx",
    },
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据库路径
DB_PATH = "chat-history.db"


def init_db():
    """
    初始化数据库
    创建聊天历史表
    """
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
    CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model TEXT NOT NULL,
        messages TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    conn.commit()
    conn.close()


# 初始化数据库
init_db()

# 模型管理相关接口
@app.get("/api/models")
def get_models():
    """
    获取已安装的模型列表
    
    Returns:
        dict: 包含模型列表的响应
    """
    try:
        result = subprocess.run(
            ["ollama", "list"],
            capture_output=True,
            text=True,
            check=True
        )
        models = []
        # 解析输出，跳过表头行
        for line in result.stdout.strip().split('\n')[1:]:
            if line:
                parts = line.split()
                if len(parts) >= 2:
                    models.append({
                        "name": parts[0],
                        "size": parts[1] if len(parts) > 1 else ""
                    })
        return {"models": models}
    except Exception as e:
        # 发生错误时返回空列表
        return {"models": []}


@app.post("/api/models/pull")
def pull_model(model_data: dict):
    """
    拉取模型
    
    Args:
        model_data (dict): 包含模型名称的请求数据
    
    Returns:
        dict: 操作结果
    
    Raises:
        HTTPException: 当模型名称未提供时
    """
    try:
        model_name = model_data.get("name")
        if not model_name:
            raise HTTPException(status_code=400, detail="Model name is required")
        # 执行模型拉取
        subprocess.run(
            ["ollama", "pull", model_name],
            check=True
        )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/models/delete")
def delete_model(model_data: dict):
    """
    删除模型
    
    Args:
        model_data (dict): 包含模型名称的请求数据
    
    Returns:
        dict: 操作结果
    
    Raises:
        HTTPException: 当模型名称未提供时
    """
    try:
        model_name = model_data.get("name")
        if not model_name:
            raise HTTPException(status_code=400, detail="Model name is required")
        # 执行模型删除
        subprocess.run(
            ["ollama", "rm", model_name],
            check=True
        )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 对话相关接口
@app.get("/api/chat/history")
def get_chat_history():
    """
    获取最新的聊天历史
    
    Returns:
        dict: 包含聊天历史的响应
    """
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT messages FROM chat_history ORDER BY timestamp DESC LIMIT 1")
    row = c.fetchone()
    conn.close()
    if row:
        return {"history": json.loads(row[0])}
    return {"history": []}


@app.post("/api/chat/completion")
def chat_completion(chat_data: dict):
    """
    生成对话完成响应
    
    Args:
        chat_data (dict): 包含模型名称和消息的请求数据
    
    Returns:
        dict: 包含生成响应的结果
    """
    try:
        model = chat_data.get("model")
        messages = chat_data.get("messages", [])
        
        if not model or not messages:
            raise HTTPException(status_code=400, detail="Model and messages are required")
        
        # 构建prompt，添加系统提示确保返回中文
        prompt = "You are a helpful assistant that responds in Chinese. Please always answer in Chinese.\n\n"
        for msg in messages:
            if msg["role"] == "user":
                prompt += f"User: {msg['content']}\n"
            elif msg["role"] == "assistant":
                prompt += f"Assistant: {msg['content']}\n"
        
        # 调用ollama run
        try:
            # 构建ollama run命令，使用正确的格式
            # 使用utf-8编码处理输入输出
            result = subprocess.run(
                ["ollama", "run", model],
                input=prompt.encode('utf-8'),
                capture_output=True,
                text=False,
                check=True
            )
            
            # 解码输出，处理字符编码
            try:
                response_text = result.stdout.decode('utf-8').strip() if result.stdout else ""
            except UnicodeDecodeError:
                # 尝试其他编码
                response_text = result.stdout.decode('gbk', errors='replace').strip() if result.stdout else ""
            
            # 检查响应是否为空
            if not response_text:
                response_text = "抱歉，我无法生成响应。请尝试再次输入。"
            
            # 保存对话历史
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute(
                "INSERT INTO chat_history (model, messages) VALUES (?, ?)",
                (model, json.dumps(messages + [{"role": "assistant", "content": response_text}]))
            )
            conn.commit()
            conn.close()
            
            return {"response": response_text}
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr.decode('utf-8', errors='replace').strip() if e.stderr else "Ollama服务执行失败"
            # 检查是否是端口占用或服务未运行的错误
            if "bind: Only one usage of each socket address" in error_msg:
                return {"response": "错误：Ollama服务端口被占用，请检查是否有其他Ollama实例在运行"}
            elif "connection refused" in error_msg or "服务未运行" in error_msg:
                return {"response": "错误：Ollama服务未运行，请先启动Ollama服务"}
            else:
                return {"response": f"错误：{error_msg}"}
    except Exception as e:
        return {"response": f"错误：{str(e)}"}


@app.post("/api/chat/export")
def export_chat(export_data: dict):
    """
    导出对话
    
    Args:
        export_data (dict): 包含导出格式和消息的请求数据
    
    Returns:
        dict: 包含导出内容的响应
    
    Raises:
        HTTPException: 当格式无效时
    """
    try:
        format = export_data.get("format", "md")
        messages = export_data.get("messages", [])
        
        if format == "md":
            content = "# 对话导出\n\n"
            for msg in messages:
                if msg["role"] == "user":
                    content += f"## 用户\n{msg['content']}\n\n"
                elif msg["role"] == "assistant":
                    content += f"## 助手\n{msg['content']}\n\n"
            return {"content": content}
        elif format == "json":
            return {"content": json.dumps(messages, ensure_ascii=False, indent=2)}
        else:
            raise HTTPException(status_code=400, detail="Invalid format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 资源监控接口
@app.get("/api/resources")
def get_resources():
    """
    获取系统资源使用情况
    
    Returns:
        dict: 包含CPU、内存和GPU使用率的响应
    """
    try:
        # 获取CPU使用率
        cpu_percent = psutil.cpu_percent()
        # 获取内存使用率
        memory = psutil.virtual_memory()
        memory_percent = memory.percent
        
        # 尝试获取GPU使用率（如果有）
        gpu_percent = 0
        try:
            import GPUtil
            gpus = GPUtil.getGPUs()
            if gpus:
                gpu_percent = gpus[0].load * 100
        except ImportError:
            # GPUtil库未安装，跳过GPU监控
            pass
        
        return {
            "cpu": cpu_percent,
            "memory": memory_percent,
            "gpu": gpu_percent
        }
    except Exception as e:
        # 发生错误时返回默认值
        return {
            "cpu": 0,
            "memory": 0,
            "gpu": 0
        }


# API调试接口
@app.post("/api/debug/{path:path}")
def debug_api(path: str, debug_data: dict):
    """
    调试API接口
    
    Args:
        path (str): API路径
        debug_data (dict): 调试数据
    
    Returns:
        dict: 调试响应
    """
    try:
        # 这里可以添加实际的Ollama API调用
        return {
            "status": "success",
            "endpoint": f"/{path}",
            "data": debug_data,
            "response": "This is a simulated response from Ollama API"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


if __name__ == "__main__":
    """
    主函数，启动FastAPI服务
    """
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
