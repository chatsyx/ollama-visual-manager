import React, { useState, useEffect, useRef } from 'react'

function ModelManagement() {
  const [models, setModels] = useState([])
  const [newModel, setNewModel] = useState('')
  const [loading, setLoading] = useState(false)
  const [pullProgress, setPullProgress] = useState(0)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [selectedModel, setSelectedModel] = useState('')
  const [newModelName, setNewModelName] = useState('')
  const [isPulling, setIsPulling] = useState(false)
  const [pullingModel, setPullingModel] = useState('')
  const progressIntervalRef = useRef(null)

  // 从localStorage加载状态
  useEffect(() => {
    const savedState = localStorage.getItem('modelManagementState')
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        setPullProgress(state.pullProgress || 0)
        setIsPulling(state.isPulling || false)
        setPullingModel(state.pullingModel || '')
      } catch (error) {
        console.error('加载状态失败:', error)
      }
    }
    
    fetchModels()
  }, [])

  // 保存状态到localStorage
  useEffect(() => {
    const state = {
      pullProgress,
      isPulling,
      pullingModel
    }
    localStorage.setItem('modelManagementState', JSON.stringify(state))
  }, [pullProgress, isPulling, pullingModel])

  // 清理定时器和重新启动进度更新
  useEffect(() => {
    // 当组件挂载且正在拉取时，重新启动进度更新
    if (isPulling && pullProgress < 90) {
      progressIntervalRef.current = setInterval(() => {
        setPullProgress(prev => {
          if (prev < 90) return prev + 5
          return prev
        })
      }, 1000)
    }

    // 清理函数
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [isPulling, pullProgress])

  const fetchModels = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/api/models')
      const data = await response.json()
      setModels(data.models || [])
    } catch (error) {
      console.error('获取模型列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const pullModel = async () => {
    if (!newModel || isPulling) return
    
    try {
      setLoading(true)
      setIsPulling(true)
      setPullingModel(newModel)
      setPullProgress(0)
      
      // 模拟进度更新
      progressIntervalRef.current = setInterval(() => {
        setPullProgress(prev => {
          if (prev < 90) return prev + 5
          return prev
        })
      }, 1000)

      const response = await fetch('http://localhost:8000/api/models/pull', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newModel })
      })
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      setPullProgress(100)
      
      await response.json()
      
      // 延迟重置状态，让用户看到完成状态
      setTimeout(() => {
        setPullProgress(0)
        setIsPulling(false)
        setPullingModel('')
        fetchModels()
        setNewModel('')
      }, 2000)
    } catch (error) {
      console.error('拉取模型失败:', error)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      setPullProgress(0)
      setIsPulling(false)
      setPullingModel('')
    } finally {
      setLoading(false)
    }
  }

  const deleteModel = async (modelName) => {
    if (window.confirm(`确定要删除模型 ${modelName} 吗？`)) {
      try {
        setLoading(true)
        await fetch('http://localhost:8000/api/models/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: modelName })
        })
        fetchModels()
      } catch (error) {
        console.error('删除模型失败:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const renameModel = async () => {
    if (!newModelName) return
    try {
      // 这里需要后端实现重命名API
      console.log('重命名模型:', selectedModel, '->', newModelName)
      setShowRenameDialog(false)
      setSelectedModel('')
      setNewModelName('')
      fetchModels()
    } catch (error) {
      console.error('重命名模型失败:', error)
    }
  }

  return (
    <div>
      <div className="card">
        <h3>拉取新模型</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            className="input"
            placeholder="输入模型名称 (例如: llama3:8b)"
            value={newModel}
            onChange={(e) => setNewModel(e.target.value)}
            disabled={isPulling}
          />
          <button 
            className="button" 
            onClick={pullModel} 
            disabled={loading || isPulling || !newModel}
          >
            {isPulling ? '拉取中...' : loading ? '加载中...' : '拉取'}
          </button>
        </div>
        {(pullProgress > 0 || isPulling) && (
          <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
              {isPulling ? `正在拉取: ${pullingModel}` : '拉取完成!'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>拉取进度:</span>
              <span>{pullProgress}%</span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#e9ecef', borderRadius: '5px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${pullProgress}%`, 
                  height: '100%', 
                  backgroundColor: pullProgress === 100 ? '#27ae60' : '#3498db',
                  transition: 'width 0.5s ease, backgroundColor 0.5s ease'
                }}
              />
            </div>
            {pullProgress === 100 && (
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#27ae60' }}>
                ✓ 模型拉取完成，正在更新列表...
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h3>已安装模型</h3>
        {loading && !isPulling ? (
          <p>加载中...</p>
        ) : models.length === 0 ? (
          <p>暂无安装的模型</p>
        ) : (
          <div className="model-list">
            {models.map((model) => (
              <div key={model.name} className="model-card">
                <h4>{model.name}</h4>
                <p>大小: {model.size || '未知'}</p>
                <div className="model-actions">
                  <button 
                    className="button"
                    onClick={() => {
                      setSelectedModel(model.name)
                      setNewModelName(model.name)
                      setShowRenameDialog(true)
                    }}
                  >
                    重命名
                  </button>
                  <button 
                    className="button button-danger" 
                    onClick={() => deleteModel(model.name)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 重命名对话框 */}
      {showRenameDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
            color: 'var(--text-color)'
          }}>
            <h3>重命名模型</h3>
            <input
              type="text"
              className="input"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              style={{ marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                className="button"
                onClick={() => {
                  setShowRenameDialog(false)
                  setSelectedModel('')
                  setNewModelName('')
                }}
              >
                取消
              </button>
              <button 
                className="button"
                onClick={renameModel}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelManagement