import AsyncStorage from '@react-native-async-storage/async-storage'

const DEFAULT_API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || ''

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
const REQUEST_TIMEOUT_MS = 8000

let cachedApiBaseUrl = FALLBACK_API_BASE_URL

const normalizeBaseUrl = (value) => {
  if (value == null) {
    return ''
  }

  const trimmed = String(value).trim().replace(/\/+$/, '')

  if (!trimmed) {
    return ''
  }

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

// Gongyoleg RFID workflow
export async function getGongyolegekRfids() {
  return apiGet('/gongyolegek/rfids')
}

export async function getInactiveGongyolegek() {
  return apiGet('/gongyolegek/inactive')
}

export async function getCimkeVkods() {
  return apiGet('/cimkek/vkodok')
}

// First form: creates an inactive record for the selected gongyoleg and RFIDs.
export async function createInactiveGongyoleg({ g_id, lf_id, RFID }) {
  return apiPost('/gongyolegek', { g_id, lf_id, RFID })
}

// Second form: applies the scanned vkod to the label and activates the pairing.
export async function completeGongyolegPairing({ pairing_id, g_id, lf_id, RFID, vkod }) {
  return apiPost('/cimkek', { pairing_id, g_id, lf_id, RFID, vkod })
}



export async function apiGet(path) {
  return doRequest('GET', path)
}

export async function apiPost(path, body) {
  return doRequest('POST', path, body)
}

async function doRequest(method, path, body = null, options = {}) {
  const baseUrl = await getApiBaseUrl()

  if (!baseUrl) {
    throw new Error('A szerver címe nincs beállítva.')
  }

  let url
  try {
    url = new URL(path, baseUrl).toString()
  } catch (e) {
    const b = String(baseUrl).replace(/\/+$/g, '')
    const p = String(path || '').trim()
    url = `${b}${p.startsWith('/') ? p : `/${p}`}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const headers = {
      Accept: 'application/json',
      ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    }

    const resp = await fetch(url, {
      method,
      signal: controller.signal,
      headers,
      ...(body != null ? { body: JSON.stringify(body) } : {}),
      ...options,
    })

    clearTimeout(timeoutId)

    const text = await resp.text()
    let payload = null

    if (text) {
      try {
        payload = JSON.parse(text)
      } catch (e) {
        throw new Error('Érvénytelen szerverválasz')
      }
    }

    if (!resp.ok) {
      const rawText = typeof text === 'string' ? text : ''
      const cleanText = rawText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      const message = payload?.error || cleanText || resp.statusText || `HTTP ${resp.status}`
      const short = message && message.length > 120 ? `${message.slice(0, 117)}...` : message
      throw new Error(short || 'Szerverhiba')
    }

    return payload
  } catch (err) {
    clearTimeout(timeoutId)
    try {
      // eslint-disable-next-line no-console
      console.error('API request error for', url, err)
    } catch (e) {
      // ignore
    }

    if (err?.name === 'AbortError') {
      throw new Error('A kérés időtúllépett')
    }

    const isNetworkErr = err?.message?.includes('Network request failed') || err?.code === 'ECONNREFUSED' || err?.code === 'ENOTFOUND'
    if (isNetworkErr) {
      throw new Error(err?.message ? `A szerver nem elérhető: ${err.message}` : 'A szerver nem elérhető')
    }

    throw err
  }
}
