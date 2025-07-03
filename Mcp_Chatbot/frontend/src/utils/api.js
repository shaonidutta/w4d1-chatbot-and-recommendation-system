import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    
    // Handle different error types
    if (error.response?.status === 404) {
      console.error('API endpoint not found')
    } else if (error.response?.status === 500) {
      console.error('Server error')
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout')
    }
    
    return Promise.reject(error)
  }
)

// API functions
export const chatAPI = {
  // Send a chat message (chat type is auto-detected by backend)
  sendMessage: async (query) => {
    try {
      const response = await api.post('/chat', {
        query
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to send message')
    }
  },

  // Get health status
  getHealth: async () => {
    try {
      const response = await api.get('/health')
      return response.data
    } catch (error) {
      throw new Error('Failed to get health status')
    }
  },

  // Get available topics
  getTopics: async () => {
    try {
      const response = await api.get('/topics')
      return response.data
    } catch (error) {
      throw new Error('Failed to get topics')
    }
  },

  // Search documents directly
  searchDocuments: async (query, k = 5) => {
    try {
      const response = await api.post('/search', {
        query,
        k,
      })
      return response.data
    } catch (error) {
      throw new Error('Failed to search documents')
    }
  },

  // Get system stats
  getStats: async () => {
    try {
      const response = await api.get('/stats')
      return response.data
    } catch (error) {
      throw new Error('Failed to get system stats')
    }
  },
}

export default api
