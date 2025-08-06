// services/practices.js - Practices API calls
import api from './api'

// Get current month practices for a specific crop
export const getCurrentPractices = async (crop = 'Coffee') => {
  const response = await api.get(`/practices/current?crop=${crop}`)
  return response.data
}

// Get all practices for a specific crop
export const getAllPracticesForCrop = async (crop) => {
  const response = await api.get(`/practices/crop/${crop}`)
  return response.data
}

// Get practices with filters
export const getPractices = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString()
  const response = await api.get(`/practices?${params}`)
  return response.data
}