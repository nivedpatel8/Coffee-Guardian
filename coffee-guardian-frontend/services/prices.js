// services/prices.js - Price monitoring API calls
import api from './api'

// Get latest prices for all crops
export const getLatestPrices = async (crop = null) => {
  const params = crop ? `?crop=${crop}` : ''
  const response = await api.get(`/prices/latest${params}`)
  return response.data
}

// Get price history for specific crop/variety
export const getPriceHistory = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await api.get(`/prices/history?${queryString}`)
  return response.data
}

// Get price trends and analytics
export const getPriceTrends = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await api.get(`/prices/trends?${queryString}`)
  return response.data
}

// Get market comparison
export const getMarketComparison = async (crop, variety) => {
  const response = await api.get(`/prices/comparison?crop=${crop}&variety=${variety}`)
  return response.data
}

// Get price alerts
export const getPriceAlerts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await api.get(`/prices/alerts?${queryString}`)
  return response.data
}

// Get demo price data
export const getDemoPrices = async () => {
  const response = await api.get('/prices/demo')
  return response.data
}

// Admin only: Add new price data
export const addPriceData = async (pricesData) => {
  const response = await api.post('/prices', { prices: pricesData })
  return response.data
}