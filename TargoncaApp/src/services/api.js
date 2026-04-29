import { Platform } from 'react-native'

const DEFAULT_API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3004',
  ios: 'http://127.0.0.1:3004',
  default: 'http://192.168.50.81:3004',
})

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL

async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    })

    const text = await response.text()
    let payload = null

    if (text) {
      try {
        payload = JSON.parse(text)
      } catch {
        payload = { raw: text }
      }
    }

    if (!response.ok) {
      const rawText = typeof payload?.raw === 'string' ? payload.raw : ''
      const cleanText = rawText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      const message = payload?.error || cleanText || rawText || `HTTP ${response.status}`
      throw new Error(message)
    }

    if (text && payload && payload.raw) {
      throw new Error(`Invalid JSON response from ${path}: ${payload.raw.slice(0, 200)}`)
    }

    return payload
  } catch (error) {
    if (error?.message?.includes('Network request failed')) {
      throw new Error('Nincs internetkapcsolat vagy a szerver nem elérhető.')
    }

    throw error
  }
}

export function apiGet(path) {
  return request(path)
}

export function apiPost(path, body) {
  return request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
