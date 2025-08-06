// utils/format.js - Utility functions for formatting data
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'

// Format currency in Indian Rupees
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format numbers with Indian number system
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0'
  return new Intl.NumberFormat('en-IN').format(number)
}

// Format date in different styles
export const formatDate = (date, formatStyle = 'medium') => {
  if (!date) return ''
  
  const dateObj = new Date(date)
  
  switch (formatStyle) {
    case 'short':
      return format(dateObj, 'dd/MM/yyyy')
    case 'medium':
      return format(dateObj, 'dd MMM yyyy')
    case 'long':
      return format(dateObj, 'dd MMMM yyyy')
    case 'relative':
      if (isToday(dateObj)) return 'Today'
      if (isYesterday(dateObj)) return 'Yesterday'
      return formatDistanceToNow(dateObj, { addSuffix: true })
    default:
      return format(dateObj, formatStyle)
  }
}

// Format time
export const formatTime = (date) => {
  if (!date) return ''
  return format(new Date(date), 'HH:mm')
}

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%'
  return `${Number(value).toFixed(decimals)}%`
}

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Get current date in ISO format for date inputs
export const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0]
}

// Get month name
export const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[monthNumber - 1] || ''
}

// Get current month name
export const getCurrentMonthName = () => {
  return getMonthName(new Date().getMonth() + 1)
}

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Generate random color for charts
export const generateColor = (index) => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ]
  return colors[index % colors.length]
}

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}