// services/expenses.js - Expense management API calls
import api from './api'

// Get all expenses with pagination and filtering
export const getExpenses = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await api.get(`/expenses?${queryString}`)
  return response.data
}

// Add new expense (with optional file upload)
export const addExpense = async (expenseData, receiptFile = null) => {
  const formData = new FormData()
  
  // Add all expense data to form data
  Object.keys(expenseData).forEach(key => {
    formData.append(key, expenseData[key])
  })
  
  // Add receipt file if provided
  if (receiptFile) {
    formData.append('receipt', receiptFile)
  }

  const response = await api.post('/expenses', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// Update expense
export const updateExpense = async (id, expenseData, receiptFile = null) => {
  const formData = new FormData()
  
  // Add all expense data to form data
  Object.keys(expenseData).forEach(key => {
    formData.append(key, expenseData[key])
  })
  
  // Add receipt file if provided
  if (receiptFile) {
    formData.append('receipt', receiptFile)
  }

  const response = await api.put(`/expenses/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// Delete expense
export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`)
  return response.data
}

// Get expense statistics
export const getExpenseStats = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await api.get(`/expenses/stats?${queryString}`)
  return response.data
}

// Get expense report by category
export const getExpenseReport = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await api.get(`/expenses/report?${queryString}`)
  return response.data
}

// Get top expenses
export const getTopExpenses = async (limit = 5) => {
  const response = await api.get(`/expenses/top?limit=${limit}`)
  return response.data
}