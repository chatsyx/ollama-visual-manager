import React, { useState, useEffect } from 'react'

function ResourceMonitor() {
  const [resources, setResources] = useState({
    cpu: 0,
    memory: 0,
    gpu: 0
  })

  useEffect(() => {
    const interval = setInterval(fetchResources, 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchResources = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/resources')
      const data = await response.json()
      setResources(data)
    } catch (error) {
      console.error('获取资源使用情况失败:', error)
    }
  }

  return (
    <div>
      <div className="card">
        <h3>系统资源监控</h3>
        <div className="resource-monitor">
          <div className="resource-card">
            <h4>CPU使用率</h4>
            <div className="value">{resources.cpu.toFixed(1)}%</div>
          </div>
          <div className="resource-card">
            <h4>内存使用率</h4>
            <div className="value">{resources.memory.toFixed(1)}%</div>
          </div>
          <div className="resource-card">
            <h4>GPU使用率</h4>
            <div className="value">{resources.gpu.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResourceMonitor