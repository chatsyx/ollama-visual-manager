import React, { useState } from 'react'

function ApiDebugger() {
  const [endpoint, setEndpoint] = useState('/api/generate')
  const [model, setModel] = useState('llama3:8b')
  const [prompt, setPrompt] = useState('Hello, how are you?')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(512)
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const sendRequest = async () => {
    setLoading(true)
    try {
      const requestData = {
        model,
        prompt,
        options: {
          temperature: parseFloat(temperature),
          max_tokens: parseInt(maxTokens)
        }
      }

      const apiResponse = await fetch(`http://localhost:8000/api/debug${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      const data = await apiResponse.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="card">
        <h3>API调试</h3>
        <div className="api-debugger">
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>API端点</label>
            <input
              type="text"
              className="input"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>模型</label>
            <input
              type="text"
              className="input"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>提示词</label>
            <textarea
              className="input"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>温度</label>
              <input
                type="number"
                className="input"
                step="0.1"
                min="0"
                max="2"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>最大 tokens</label>
              <input
                type="number"
                className="input"
                min="1"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
              />
            </div>
          </div>

          <button className="button" onClick={sendRequest} disabled={loading}>
            {loading ? '发送中...' : '发送请求'}
          </button>

          {response && (
            <div style={{ marginTop: '20px' }}>
              <h4>响应结果</h4>
              <pre>{response}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApiDebugger