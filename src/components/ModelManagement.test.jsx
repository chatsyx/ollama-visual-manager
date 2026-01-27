import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ModelManagement from './ModelManagement'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('ModelManagement Component', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  test('renders model management interface', () => {
    render(<ModelManagement />)
    expect(screen.getByText('拉取新模型')).toBeInTheDocument()
    expect(screen.getByText('已安装模型')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('输入模型名称 (例如: llama3:8b)')).toBeInTheDocument()
  })

  test('fetches models on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ models: [{ name: 'llama3:8b', size: '4.5GB' }] })
    })

    render(<ModelManagement />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/models')
    })

    await waitFor(() => {
      expect(screen.getByText('llama3:8b')).toBeInTheDocument()
    })
  })

  test('pulls new model when form submitted', async () => {
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ models: [] }) })
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ status: 'success' }) })
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ models: [{ name: 'llama3:8b', size: '4.5GB' }] }) })

    render(<ModelManagement />)

    const input = screen.getByPlaceholderText('输入模型名称 (例如: llama3:8b)')
    const button = screen.getByText('拉取')

    fireEvent.change(input, { target: { value: 'llama3:8b' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/models/pull', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: 'llama3:8b' })
      })
    })
  })

  test('deletes model when delete button clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ models: [{ name: 'llama3:8b', size: '4.5GB' }] })
    })
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ status: 'success' }) })
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ models: [] }) })

    render(<ModelManagement />)

    await waitFor(() => {
      expect(screen.getByText('llama3:8b')).toBeInTheDocument()
    })

    const deleteButton = screen.getByText('删除')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/models/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: 'llama3:8b' })
      })
    })
  })

  test('shows loading state when fetching models', async () => {
    mockFetch.mockResolvedValueOnce(new Promise(resolve => setTimeout(() => resolve({ json: () => Promise.resolve({ models: [] }) }), 100)))

    render(<ModelManagement />)

    expect(screen.getByText('加载中...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument()
    })
  })

  test('shows empty state when no models available', async () => {
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ models: [] }) })

    render(<ModelManagement />)

    await waitFor(() => {
      expect(screen.getByText('暂无安装的模型')).toBeInTheDocument()
    })
  })
})
