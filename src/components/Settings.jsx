import React, { useState, useEffect } from 'react'

function Settings() {
  const [ollamaApiUrl, setOllamaApiUrl] = useState('http://localhost:11434')
  const [databasePath, setDatabasePath] = useState('./chat-history.db')
  const [theme, setTheme] = useState('light')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // 从localStorage加载保存的设置
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setOllamaApiUrl(settings.ollamaApiUrl || 'http://localhost:11434')
      setDatabasePath(settings.databasePath || './chat-history.db')
      setTheme(settings.theme || 'light')
      // 应用保存的主题
      applyTheme(settings.theme || 'light')
    }
  }, [])

  const applyTheme = (newTheme) => {
    // 移除现有的主题类
    document.body.classList.remove('light-theme', 'dark-theme')
    // 添加新的主题类
    document.body.classList.add(`${newTheme}-theme`)
    
    // 更新CSS变量
    if (newTheme === 'dark') {
      document.documentElement.style.setProperty('--bg-color', '#1a1a1a')
      document.documentElement.style.setProperty('--text-color', '#ffffff')
      document.documentElement.style.setProperty('--card-bg', '#2c2c2c')
      document.documentElement.style.setProperty('--sidebar-bg', '#1e1e1e')
      document.documentElement.style.setProperty('--button-bg', '#3498db')
      document.documentElement.style.setProperty('--border-color', '#444444')
    } else {
      document.documentElement.style.setProperty('--bg-color', '#f5f5f5')
      document.documentElement.style.setProperty('--text-color', '#333333')
      document.documentElement.style.setProperty('--card-bg', '#ffffff')
      document.documentElement.style.setProperty('--sidebar-bg', '#2c3e50')
      document.documentElement.style.setProperty('--button-bg', '#3498db')
      document.documentElement.style.setProperty('--border-color', '#dddddd')
    }
  }

  const saveSettings = () => {
    const settings = {
      ollamaApiUrl,
      databasePath,
      theme
    }
    localStorage.setItem('appSettings', JSON.stringify(settings))
    applyTheme(theme)
    setSaved(true)
    
    // 显示保存成功消息
    setTimeout(() => {
      setSaved(false)
    }, 3000)
  }

  return (
    <div>
      <div className="card">
        <h3>应用设置</h3>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Ollama API地址</label>
          <input
            type="text"
            className="input"
            value={ollamaApiUrl}
            onChange={(e) => setOllamaApiUrl(e.target.value)}
            placeholder="http://localhost:11434"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>数据库路径</label>
          <input
            type="text"
            className="input"
            value={databasePath}
            onChange={(e) => setDatabasePath(e.target.value)}
            placeholder="./chat-history.db"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>主题</label>
          <select 
            className="input"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <button 
            className="button" 
            onClick={saveSettings}
            style={{ position: 'relative' }}
          >
            保存设置
            {saved && (
              <span style={{ 
                marginLeft: '10px', 
                color: '#27ae60',
                fontSize: '14px'
              }}>
                ✓ 保存成功
              </span>
            )}
          </button>
        </div>

        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '5px',
          fontSize: '14px',
          color: '#1976d2'
        }}>
          <p>提示：主题更改需要保存后才能生效</p>
          <p>当前主题：{theme === 'light' ? '浅色' : '深色'}</p>
        </div>
      </div>

      <div className="card">
        <h3>关于</h3>
        <p>Ollama Visual Manager v1.0.0</p>
        <p>跨平台Ollama可视化管理工具</p>
        <p>MIT许可证</p>
      </div>
    </div>
  )
}

export default Settings