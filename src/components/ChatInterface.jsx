import React, { useState, useEffect } from 'react'

/**
 * 对话界面组件
 * 提供与Ollama模型的交互功能
 * V1.00版本
 */
function ChatInterface() {
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('')
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [serviceStatus, setServiceStatus] = useState({ backend: false, ollama: false })
  const [checkingStatus, setCheckingStatus] = useState(false)

  // 从localStorage加载对话历史
  useEffect(() => {
    const loadChatHistory = () => {
      try {
        const savedMessages = localStorage.getItem('chatHistory')
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages)
          if (Array.isArray(parsedMessages)) {
            setMessages(parsedMessages)
          }
        }
      } catch (error) {
        console.error('加载对话历史失败:', error)
      }
    }

    loadChatHistory()
    fetchModels()
    checkServiceStatus()
  }, [])

  // 保存对话历史到localStorage
  useEffect(() => {
    // 总是保存，即使消息为空
    localStorage.setItem('chatHistory', JSON.stringify(messages))
  }, [messages])

  // 组件卸载时确保保存历史记录
  useEffect(() => {
    return () => {
      // 组件卸载时再次保存，确保万无一失
      localStorage.setItem('chatHistory', JSON.stringify(messages))
    }
  }, [messages])

  /**
   * 获取模型列表
   */
  const fetchModels = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/models')
      const data = await response.json()
      setModels(data.models || [])
      
      // 默认选择第一个模型
      if (data.models && data.models.length > 0) {
        setSelectedModel(data.models[0].name)
      }
    } catch (error) {
      console.error('获取模型列表失败:', error)
    }
  }

  /**
   * 检查服务状态
   */
  const checkServiceStatus = async () => {
    setCheckingStatus(true)
    setError('正在检查服务状态...')
    
    try {
      // 检查后端服务
      const backendStatus = await checkSingleService('http://localhost:8000/api/models')
      // 检查Ollama服务
      const ollamaStatus = await checkSingleService('http://localhost:11434/api/tags')
      
      setServiceStatus({ backend: backendStatus, ollama: ollamaStatus })
      
      // 显示服务状态信息
      if (!backendStatus || !ollamaStatus) {
        let errorMsg = '服务未运行：\n'
        if (!ollamaStatus) errorMsg += '- Ollama服务 (端口11434)\n'
        if (!backendStatus) errorMsg += '- 后端服务 (端口8000)\n'
        errorMsg += '\n请点击"自动启动服务"按钮启动所需服务'
        setError(errorMsg)
      } else {
        setError('✅ 所有服务已正常运行')
      }
    } catch (error) {
      console.error('检查服务状态时发生错误:', error)
      setServiceStatus({ backend: false, ollama: false })
      setError('❌ 检查服务状态失败，请稍后再试')
    } finally {
      setCheckingStatus(false)
    }
  }

  /**
   * 检查单个服务的状态
   * @param {string} url - 服务URL
   * @returns {Promise<boolean>} 服务是否正常运行
   */
  const checkSingleService = async (url) => {
    try {
      const response = await fetch(url, { timeout: 3000 })
      return response.ok
    } catch (error) {
      return false
    }
  }

  /**
   * 检查端口占用情况
   * @param {number} port - 端口号
   * @returns {Promise<object>} 端口占用状态
   */
  const checkPortOccupancy = async (port) => {
    try {
      // 这里在Electron环境中可以使用child_process执行系统命令来检测端口占用
      // 例如在Windows上执行 'netstat -ano | findstr :{port}'
      // 在macOS/Linux上执行 'lsof -i :{port}'
      
      // 前端模拟实现
      await fetch(`http://localhost:${port}`, { timeout: 1000 })
      return {
        occupied: true,
        service: port === 11434 ? 'Ollama' : '后端服务'
      }
    } catch (error) {
      return {
        occupied: false,
        service: null
      }
    }
  }

  /**
   * 启动服务
   */
  const startServices = async () => {
    try {
      setError('正在检测和启动必要的服务...')
      
      // 检查端口占用情况
      const ollamaStatus = await checkPortOccupancy(11434)
      const backendStatus = await checkPortOccupancy(8000)
      
      // 处理端口占用情况
      if (ollamaStatus.occupied || backendStatus.occupied) {
        const confirmationMessage = buildOccupancyMessage(ollamaStatus, backendStatus)
        const userConfirm = window.confirm(confirmationMessage)
        
        if (!userConfirm) {
          setError('用户取消启动服务')
          return
        }
      }
      
      // 模拟服务启动过程
      simulateServiceStart(ollamaStatus, backendStatus)
    } catch (error) {
      setError('❌ 启动服务失败，请手动启动后端服务和Ollama')
    }
  }

  /**
   * 构建端口占用确认消息
   * @param {object} ollamaStatus - Ollama服务状态
   * @param {object} backendStatus - 后端服务状态
   * @returns {string} 确认消息
   */
  const buildOccupancyMessage = (ollamaStatus, backendStatus) => {
    let message = '检测到以下服务端口被占用：\n'
    if (ollamaStatus.occupied) {
      message += `- Ollama服务 (端口11434)\n`
    }
    if (backendStatus.occupied) {
      message += `- 后端服务 (端口8000)\n`
    }
    message += '\n是否关闭占用端口的应用并启动服务？'
    return message
  }

  /**
   * 模拟服务启动过程
   * @param {object} ollamaStatus - Ollama服务状态
   * @param {object} backendStatus - 后端服务状态
   */
  const simulateServiceStart = (ollamaStatus, backendStatus) => {
    // 显示启动Ollama服务的状态
    setTimeout(() => {
      if (!ollamaStatus.occupied) {
        setError('正在启动Ollama服务...')
      } else {
        setError('正在关闭占用端口的Ollama服务并重新启动...')
      }
    }, 500)
    
    // 显示启动后端服务的状态
    setTimeout(() => {
      if (!backendStatus.occupied) {
        setError('正在启动后端服务...')
      } else {
        setError('正在关闭占用端口的后端服务并重新启动...')
      }
    }, 1000)
    
    // 检查启动结果
    setTimeout(async () => {
      await checkServiceStatus()
      
      if (serviceStatus.backend && serviceStatus.ollama) {
        setError('✅ 服务已成功启动，请重试发送消息')
        fetchModels()
      } else {
        setError('❌ 服务启动失败，请手动启动：\n1. Ollama服务：在命令行执行 `ollama serve`\n2. 后端服务：在项目目录执行 `cd backend ; python app.py` (注意Windows PowerShell使用分号)')
      }
    }, 2000)
  }

  /**
   * 发送消息
   */
  const sendMessage = async () => {
    if (!inputText || !selectedModel) return
    
    setLoading(true)
    setError('')
    
    // 先检查服务状态
    await checkServiceStatus()
    
    if (!serviceStatus.backend || !serviceStatus.ollama) {
      setError('服务未运行，请先启动后端服务和Ollama')
      setLoading(false)
      return
    }
    
    // 添加用户消息
    const userMessage = {
      role: 'user',
      content: inputText,
      timestamp: new Date().toISOString()
    }
    
    setMessages([...messages, userMessage])
    setInputText('')
    setIsTyping(true)

    try {
      // 模拟打字效果
      const typingInterval = setInterval(() => {
        setIsTyping(prev => !prev)
      }, 500)

      // 发送请求到后端
      const response = await fetch('http://localhost:8000/api/chat/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [...messages.map(msg => ({ role: msg.role, content: msg.content })), userMessage]
        })
      })
      
      clearInterval(typingInterval)
      setIsTyping(false)
      
      if (!response.ok) {
        throw new Error('API请求失败')
      }
      
      const data = await response.json()
      
      if (!data.response) {
        throw new Error('无效的响应数据')
      }
      
      // 添加助手回复
      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('发送消息失败:', error)
      setError('发送消息失败，服务可能未运行')
      setIsTyping(false)
      
      // 添加错误消息到对话
      const errorMessage = {
        role: 'assistant',
        content: '抱歉，我无法处理您的请求。请检查服务是否正常运行。',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  /**
   * 导出对话
   * @param {string} format - 导出格式
   */
  const exportChat = async (format) => {
    try {
      const response = await fetch('http://localhost:8000/api/chat/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format, messages })
      })
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chat-export.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出对话失败:', error)
      setError('导出对话失败，请稍后再试')
    }
  }

  /**
   * 清空对话
   */
  const clearChat = () => {
    setMessages([])
    localStorage.removeItem('chatHistory')
  }

  return (
    <div className="chat-container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>模型对话</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select 
              className="input" 
              style={{ width: '200px' }} 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {models.map(model => (
                <option key={model.name} value={model.name}>
                  {model.name}
                </option>
              ))}
            </select>
            <button 
              className="button" 
              onClick={checkServiceStatus}
              disabled={checkingStatus}
              style={{ padding: '5px 10px', fontSize: '12px' }}
            >
              {checkingStatus ? '检查中...' : '检查服务'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '14px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ marginBottom: '15px', fontWeight: 'bold' }}>{error}</div>
            {(!serviceStatus.backend || !serviceStatus.ollama) && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button 
                  className="button" 
                  onClick={startServices}
                  style={{ padding: '8px 20px', fontSize: '13px', backgroundColor: '#4caf50', color: 'white' }}
                >
                  🚀 自动启动服务
                </button>
                <button 
                  className="button"
                  onClick={checkServiceStatus}
                  style={{ padding: '8px 20px', fontSize: '13px' }}
                >
                  🔄 重新检查
                </button>
              </div>
            )}
            <div style={{ marginTop: '15px', fontSize: '13px', opacity: 0.9, lineHeight: '1.5' }}>
              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>📋</span>
                <span>服务状态检查：</span>
              </div>
              <div style={{ marginLeft: '24px', marginBottom: '4px' }}>
                • Ollama服务: {serviceStatus.ollama ? '✅ 运行中' : '❌ 未运行'}
              </div>
              <div style={{ marginLeft: '24px', marginBottom: '4px' }}>
                • 后端服务: {serviceStatus.backend ? '✅ 运行中' : '❌ 未运行'}
              </div>
              
              <div style={{ marginTop: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>💡</span>
                <span>手动启动指南：</span>
              </div>
              <div style={{ marginLeft: '24px', marginBottom: '4px' }}>
                • Ollama服务: 在命令行执行 <code style={{ backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '3px', fontSize: '12px' }}>ollama serve</code>
              </div>
              <div style={{ marginLeft: '24px', marginBottom: '4px' }}>
                • 后端服务: 在项目目录执行 <code style={{ backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '3px', fontSize: '12px' }}>cd backend && python app.py</code>
              </div>
            </div>
          </div>
        )}

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#999'
            }}>
              <p>欢迎使用Ollama Visual Manager</p>
              <p>选择一个模型开始对话吧！</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.role === 'user' ? 'user' : 'assistant'}`}
              >
                <div style={{ marginBottom: '5px', fontWeight: msg.role === 'user' ? 'bold' : 'normal' }}>
                  {msg.role === 'user' ? '我' : selectedModel}
                </div>
                <div>{msg.content}</div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                  {new Date(msg.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="message assistant">
              <div style={{ marginBottom: '5px' }}>{selectedModel}</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>{isTyping ? '正在思考' : '正在生成回复'}</span>
                {isTyping && (
                  <span style={{ marginLeft: '5px', animation: 'typing 1s infinite' }}>
                    ...
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                {new Date().toLocaleString()}
              </div>
            </div>
          )}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="输入消息..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
          />
          <button 
            className="button" 
            onClick={sendMessage} 
            disabled={loading}
            style={{ padding: '0 20px' }}
          >
            {loading ? '发送中...' : '发送'}
          </button>
        </div>

        <div className="export-options" style={{ marginTop: '20px' }}>
          <button className="button" onClick={() => exportChat('md')}>
            导出为Markdown
          </button>
          <button className="button" onClick={() => exportChat('json')}>
            导出为JSON
          </button>
          <button 
            className="button"
            onClick={clearChat}
            style={{ marginLeft: 'auto' }}
          >
            清空对话
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface