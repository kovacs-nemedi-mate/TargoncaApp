import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const DEFAULT_API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3005',
  ios: 'http://127.0.0.1:3005',
  default: 'http://192.168.50.84:3005',
})

const FALLBACK_API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL
const DEFAULT_PORT = (() => {
  try {
    const u = new URL(FALLBACK_API_BASE_URL)
    return u.port || (u.protocol === 'https:' ? '443' : '80')
  } catch (e) {
    return '3005'
  }
})()
const STORAGE_KEY = '@targoncaapp/apiBaseUrl'

let cachedApiBaseUrl = FALLBACK_API_BASE_URL

const normalizeBaseUrl = (value) => {
  if (value == null) {
    return ''
  }

  let trimmed = String(value).trim().replace(/\/+$/, '')

  if (!trimmed) {
    return ''
  }

  // Ensure we have a protocol so URL parsing works reliably
  let withProto = trimmed
  if (!/^https?:\/\//i.test(trimmed)) {
    withProto = `http://${trimmed}`
  }

  try {
    const u = new URL(withProto)

    // If no port specified, append the configured default port
    if (!u.port) {
      u.port = DEFAULT_PORT
    }

    // Return origin + pathname (omit root '/') without trailing slash
    const path = u.pathname && u.pathname !== '/' ? u.pathname.replace(/\/+$/, '') : ''
    return `${u.origin}${path}`
  } catch (e) {
    // Fallback: return the original trimmed value
    return trimmed
  }
}

export async function getApiBaseUrl() {
  try {
    const storedValue = await AsyncStorage.getItem(STORAGE_KEY)
    const normalizedValue = normalizeBaseUrl(storedValue)

    if (normalizedValue) {
      cachedApiBaseUrl = normalizedValue
    }
  } catch {
    // Keep the in-memory fallback if local storage is unavailable.
  }

  return cachedApiBaseUrl
}

export async function hasStoredApiBaseUrl() {
  try {
    const storedValue = await AsyncStorage.getItem(STORAGE_KEY)
    return !!normalizeBaseUrl(storedValue)
  } catch {
    return false
  }
}

export async function setApiBaseUrl(value) {
  const normalizedValue = normalizeBaseUrl(value)

  if (!normalizedValue) {
    throw new Error('A szerver címe nem lehet üres.')
  }

  cachedApiBaseUrl = normalizedValue

  await AsyncStorage.setItem(STORAGE_KEY, normalizedValue)

  return normalizedValue
}

export async function resetApiBaseUrl() {
  cachedApiBaseUrl = FALLBACK_API_BASE_URL

  await AsyncStorage.removeItem(STORAGE_KEY)

  return cachedApiBaseUrl
}

async function request(path, options = {}) {
  // Try the stored base URL first; if it's different from the fallback and
  // the request fails due to network error, retry once with the fallback.
  const storedBase = await getApiBaseUrl()
  const basesToTry = []
  if (storedBase) basesToTry.push(storedBase)
  if (!basesToTry.includes(FALLBACK_API_BASE_URL)) basesToTry.push(FALLBACK_API_BASE_URL)

  let lastError = null
  for (const base of basesToTry) {
    const requestUrl = `${base}${path}`
    try {
      const response = await fetch(requestUrl, {
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
        const message = payload?.error || cleanText || rawText || response.statusText || `HTTP ${response.status}`
        const short = message && message.length > 120 ? `${message.slice(0, 117)}...` : message
        throw new Error(short || 'Szerverhiba')
      }

      if (text && payload && payload.raw) {
        throw new Error('Érvénytelen szerverválasz')
      }

      return payload
    } catch (error) {
      // Log the failure so it's visible in device/adb logs for troubleshooting
      try {
        // eslint-disable-next-line no-console
        console.error('API request error for', requestUrl, error)
      } catch (e) {
        // ignore logging errors
      }

      lastError = error

      // If it's a network-level failure, try the next base in the list.
      const isNetworkErr = error?.message?.includes('Network request failed') || error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND'
      if (isNetworkErr) {
        // If this was the last base to try, rethrow a concise network error.
        if (base === basesToTry[basesToTry.length - 1]) {
          throw new Error('A szerver nem elérhető')
        }
        // otherwise continue to retry with the fallback
        continue
      }

      if (error?.name === 'AbortError') {
        throw new Error('A kérés időtúllépett')
      }

      // Non-network error (HTTP status, invalid JSON, etc.) - surface a short message
      const shortErr = error?.message && error.message.length > 120 ? `${error.message.slice(0,117)}...` : error?.message
      throw new Error(shortErr || 'Kommunikációs hiba')
    }
  }

  // If we get here, rethrow the last captured error.
  throw lastError
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
