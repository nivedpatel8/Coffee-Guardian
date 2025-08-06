// services/api.js - Main API configuration with axios
import axios from 'axios'
import { toast } from 'react-hot-toast'

const base_url = import.meta.env.VITE_API_URL;

// Create axios instance with base configuration
const api = axios.create({
  baseURL:  base_url+'/api'|| '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response } = error

    // Handle network errors
    if (!response) {
      toast.error('Network error. Please check your connection.')
      return Promise.reject(error)
    }

    // Handle authentication errors
    if (response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // Handle validation errors
    if (response.status === 400 && response.data.errors) {
      const errorMessage = response.data.errors[0]?.msg || 'Validation error'
      toast.error(errorMessage)
      return Promise.reject(error)
    }

    // Handle server errors
    if (response.status >= 500) {
      toast.error('Server error. Please try again later.')
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default api