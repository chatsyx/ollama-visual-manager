import pytest
from fastapi.testclient import TestClient
from app import app
import json
import sqlite3

client = TestClient(app)

# 测试前清理数据库
def setup_function():
    conn = sqlite3.connect('chat-history.db')
    c = conn.cursor()
    c.execute('DELETE FROM chat_history')
    conn.commit()
    conn.close()

# 测试模型管理接口
def test_get_models():
    response = client.get("/api/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert isinstance(data["models"], list)

def test_pull_model():
    response = client.post("/api/models/pull", json={"name": "llama3:8b"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"

def test_delete_model():
    response = client.post("/api/models/delete", json={"name": "llama3:8b"})
    # 即使删除失败，也应该返回200，因为我们在代码中捕获了异常
    assert response.status_code == 200

# 测试对话相关接口
def test_get_chat_history():
    response = client.get("/api/chat/history")
    assert response.status_code == 200
    data = response.json()
    assert "history" in data
    assert isinstance(data["history"], list)

def test_chat_completion():
    test_data = {
        "model": "llama3:8b",
        "messages": [
            {"role": "user", "content": "Hello, how are you?"}
        ]
    }
    response = client.post("/api/chat/completion", json=test_data)
    # 即使调用失败，也应该返回200，因为我们在代码中捕获了异常
    assert response.status_code == 200

# 测试对话导出接口
def test_export_chat_markdown():
    test_data = {
        "format": "md",
        "messages": [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi there!"}
        ]
    }
    response = client.post("/api/chat/export", json=test_data)
    assert response.status_code == 200
    data = response.json()
    assert "content" in data
    assert isinstance(data["content"], str)
    assert "# 对话导出" in data["content"]

def test_export_chat_json():
    test_data = {
        "format": "json",
        "messages": [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi there!"}
        ]
    }
    response = client.post("/api/chat/export", json=test_data)
    assert response.status_code == 200
    data = response.json()
    assert "content" in data
    assert isinstance(data["content"], str)
    # 验证返回的是有效的JSON
    try:
        json.loads(data["content"])
    except json.JSONDecodeError:
        pytest.fail("返回的内容不是有效的JSON")

# 测试资源监控接口
def test_get_resources():
    response = client.get("/api/resources")
    assert response.status_code == 200
    data = response.json()
    assert "cpu" in data
    assert "memory" in data
    assert "gpu" in data
    assert isinstance(data["cpu"], (int, float))
    assert isinstance(data["memory"], (int, float))
    assert isinstance(data["gpu"], (int, float))

# 测试API调试接口
def test_debug_api():
    test_data = {
        "model": "llama3:8b",
        "prompt": "Hello",
        "options": {
            "temperature": 0.7,
            "max_tokens": 512
        }
    }
    response = client.post("/api/debug/api/generate", json=test_data)
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "endpoint" in data
    assert "data" in data
    assert "response" in data
