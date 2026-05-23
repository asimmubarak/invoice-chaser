import axios from 'axios'

const API = axios.create({
  baseURL: ''
})

// Auth
export const signup = (data) => API.post('/auth/signup', data)
export const login = (data) => API.post('/auth/login', data)

// Dashboard
export const getDashboard = (userId) => API.get(`/dashboard/?user_id=${userId}`)

// Clients
export const getClients = (userId) => API.get(`/clients/?user_id=${userId}`)
export const createClient = (data, userId) => API.post(`/clients/?user_id=${userId}`, data)
export const deleteClient = (clientId) => API.delete(`/clients/${clientId}`)

// Invoices
export const getInvoices = (userId) => API.get(`/invoices/?user_id=${userId}`)
export const createInvoice = (data, userId) => API.post(`/invoices/?user_id=${userId}`, data)
export const markPaid = (invoiceId) => API.patch(`/invoices/${invoiceId}/mark-paid`)
export const deleteInvoice = (invoiceId) => API.delete(`/invoices/${invoiceId}`)
export const scanInvoice = (formData) => API.post('/invoices/scan', formData)

// Reminders
export const getReminders = (userId) => API.get(`/invoices/reminders?user_id=${userId}`)
export const approveReminder = (reminderId) => API.patch(`/invoices/reminders/${reminderId}/approve`)
export const cancelReminder = (reminderId) => API.patch(`/invoices/reminders/${reminderId}/cancel`)
export const sendReminder = (reminderId) => API.post(`/invoices/reminders/${reminderId}/send`)