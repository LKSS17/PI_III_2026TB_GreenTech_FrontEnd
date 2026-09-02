/**
 * src/services/api.js
 * Client HTTP centralizado para o ecossistema GreenTech.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

let isRefreshing = false
let refreshSubscribers = []

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb)
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

export async function refreshToken() {
  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) throw new Error('Refresh token inexistente')

  const response = await fetch(`${BASE_URL}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh })
  })

  if (!response.ok) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  const data = await response.json()
  localStorage.setItem('access_token', data.access)
  return data.access
}

export async function apiClient(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  // Se o body for FormData, o browser define o Content-Type com boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  const token = localStorage.getItem('access_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    let response = await fetch(url, { ...options, headers })

    // Intercepta 401 para tentar refresh token
    if (response.status === 401 && localStorage.getItem('refresh_token')) {
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const newToken = await refreshToken()
          isRefreshing = false
          onRefreshed(newToken)
        } catch (err) {
          isRefreshing = false
          return Promise.reject(err)
        }
      }

      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(async (newToken) => {
          headers['Authorization'] = `Bearer ${newToken}`
          try {
            const retryRes = await fetch(url, { ...options, headers })
            const data = await parseResponse(retryRes)
            resolve(data)
          } catch (e) {
            reject(e)
          }
        })
      })
    }

    return await parseResponse(response)
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error)
    throw error
  }
}

async function parseResponse(response) {
  const isJson = (response.headers.get('content-type') || '').includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    let message = 'Erro de comunicação com o servidor.'
    if (typeof payload === 'object' && payload !== null) {
      message = payload.detail || payload.message || Object.values(payload)[0] || message
      if (Array.isArray(message)) message = message[0]
    }
    const error = new Error(message)
    error.status = response.status
    error.data = payload
    throw error
  }

  return payload
}

export default apiClient