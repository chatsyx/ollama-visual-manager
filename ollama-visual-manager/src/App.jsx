import React, { useState } from 'react'
import ModelManagement from './components/ModelManagement'
import ChatInterface from './components/ChatInterface'
import ResourceMonitor from './components/ResourceMonitor'
import ApiDebugger from './components/ApiDebugger'
import Settings from './components/Settings'

function App() {
  const [activePage, setActivePage] = useState('models')

  const renderPage = () => {
    switch (activePage) {
      case 'models':
        return <ModelManagement />
      case 'chat':
        return <ChatInterface />
      case 'monitor':
        return <ResourceMonitor />
      case 'api':
        return <ApiDebugger />
      case 'settings':
        return <Settings />
      default:
        return <ModelManagement />
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Ollama Visual Manager</h2>
        <nav>
          <ul>
            <li>
              <a 
                href="#" 
                className={activePage === 'models' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault()
                  setActivePage('models')
                }}
              >
                模型管理
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={activePage === 'chat' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault()
                  setActivePage('chat')
                }}
              >
                对话界面
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={activePage === 'monitor' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault()
                  setActivePage('monitor')
                }}
              >
                资源监控
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={activePage === 'api' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault()
                  setActivePage('api')
                }}
              >
                API调试
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={activePage === 'settings' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault()
                  setActivePage('settings')
                }}
              >
                设置
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <div className="header">
          <h1>{activePage === 'models' ? '模型管理' : 
                 activePage === 'chat' ? '对话界面' : 
                 activePage === 'monitor' ? '资源监控' : 
                 activePage === 'api' ? 'API调试' : '设置'}</h1>
        </div>
        {renderPage()}
      </main>
    </div>
  )
}

export default App