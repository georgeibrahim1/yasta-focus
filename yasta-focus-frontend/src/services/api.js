import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token from login/signup
api.interceptors.response.use(
  (response) => {
    // Store token from login/signup responses
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response
  },
  (error) => {
    // Handle 401 errors by clearing token and redirecting to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // Only redirect if not already on auth page
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth'
      }
    }
    return Promise.reject(error)
  }
)