import { notification } from 'antd'
import { chatStore, userStore, adminStore } from '@/store'

export type ResponseData<T> = {
  code: number
  data: T
  message: string
}

export type RequestConfig = { timeout?: number }

function isResponseData<T>(obj: any): obj is ResponseData<T> {
  return 'code' in obj && 'data' in obj && 'message' in obj
}

// Check if base domain prefix is needed
const getBaseUrl = (url: string) => {
  const baseURL = import.meta.env.VITE_APP_REQUEST_HOST
  // If baseURL is not set, use relative URL (will be proxied by Vite in dev mode)
  if (!baseURL) {
    if (/^http(s?):\/\//i.test(url)) return url
    return url
  }
  if (/^http(s?):\/\//i.test(url)) return url
  return baseURL + url
}

// Transform Headers
function correctHeaders(
  method = 'GET',
  headers: HeadersInit & {
    'Content-Type'?: string
  } = {}
) {
  if (headers['Content-Type'] === 'multipart/form-data') {
    delete headers['Content-Type']
    return headers
  }
  if ((method === 'GET' || method === 'DELETE') && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
  }
  if ((method === 'POST' || method === 'PUT') && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  return headers
}

// Check if it's an Object
const isPlainObject = (obj: any) => {
  if (!obj || Object.prototype.toString.call(obj) !== '[object Object]' || obj instanceof FormData) {
    return false
  }
  const proto = Object.getPrototypeOf(obj)
  if (!proto) return true
  const Ctor = Object.prototype.hasOwnProperty.call(proto, 'constructor') && proto.constructor
  return typeof Ctor === 'function' && Ctor === Object
}

// Helper function to check if URL is an admin endpoint
const isAdminEndpoint = (url: string): boolean => {
  if (!url) return false
  
  let pathname = ''
  try {
    // Try to parse as absolute URL first
    if (url.startsWith('http://') || url.startsWith('https://')) {
      pathname = new URL(url).pathname
    } else {
      // For relative URLs, try with current origin
      const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
      pathname = new URL(url, base).pathname
    }
  } catch (error) {
    // Fallback: extract pathname manually
    pathname = url
    // Remove query string and hash
    const queryIndex = pathname.indexOf('?')
    if (queryIndex >= 0) {
      pathname = pathname.substring(0, queryIndex)
    }
    const hashIndex = pathname.indexOf('#')
    if (hashIndex >= 0) {
      pathname = pathname.substring(0, hashIndex)
    }
    // If it doesn't start with /, try to find /api/ in the string
    if (!pathname.startsWith('/')) {
      const apiIndex = pathname.indexOf('/api/')
      if (apiIndex >= 0) {
        pathname = pathname.substring(apiIndex)
      } else if (pathname.includes('/api/admin')) {
        // Extract from anywhere in the string
        const adminIndex = pathname.indexOf('/api/admin')
        pathname = pathname.substring(adminIndex)
      }
    }
  }
  
  // Check if pathname starts with /api/admin
  return pathname.startsWith('/api/admin')
}

// Request interceptor
const interceptorsRequest = (config: { url: string; options?: RequestInit }) => {
  // Log incoming URL for admin endpoints to track any transformations
  const incomingUrl = config.url
  if (incomingUrl && incomingUrl.includes('/api/admin')) {
    console.log('🔍 Interceptor - Incoming URL:', {
      url: incomingUrl,
      type: typeof incomingUrl,
      length: incomingUrl.length
    })
  }
  
  // Get current page context first
  let isOnAdminPage = false
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname || ''
    isOnAdminPage = currentPath.startsWith('/admin') && currentPath !== '/admin/login'
  }

  // Check if URL is an admin endpoint using multiple methods
  // First, do a simple string check (works for both relative and absolute URLs)
  const urlContainsAdminApi = typeof config.url === 'string' && config.url.includes('/api/admin')
  // Then, do path-based detection (more robust for edge cases)
  const isAdminApiByPath = isAdminEndpoint(config.url)
  // Final determination: if either method detects it, it's an admin API
  const finalIsAdminApi = urlContainsAdminApi || isAdminApiByPath
  
  // Log detection results for admin endpoints
  if (incomingUrl && incomingUrl.includes('/api/admin')) {
    console.log('🔍 Interceptor - Detection Results:', {
      incomingUrl,
      urlContainsAdminApi,
      isAdminApiByPath,
      finalIsAdminApi,
      isOnAdminPage
    })
  }

  // Get tokens - ALWAYS read fresh from stores (don't cache)
  // This ensures we get the latest token values even if stores are updated
  const adminState = adminStore.getState()
  const userState = userStore.getState()
  let adminToken = adminState?.admin_token
  let userToken = userState?.token
  
  // CRITICAL: Check login timestamps FIRST before using any tokens
  // If there's no timestamp, the user logged out and we should NOT use the token
  let adminTime = 0
  let userTime = 0
  
  if (typeof window !== 'undefined') {
    try {
      const adminLoginTime = localStorage.getItem('admin_last_login_time')
      const userLoginTime = localStorage.getItem('user_last_login_time')
      
      adminTime = adminLoginTime ? parseInt(adminLoginTime, 10) : 0
      userTime = userLoginTime ? parseInt(userLoginTime, 10) : 0
    } catch (e) {
      console.warn('Failed to read login timestamps:', e)
    }
  }
  
  // IMPORTANT: Only use tokens that have a valid login timestamp
  // If no timestamp exists, clear the token (user logged out)
  if (adminTime === 0 && adminToken) {
    console.warn('[TOKEN] Admin token exists but no login timestamp - user logged out, clearing token')
    adminToken = undefined
  }
  
  if (userTime === 0 && userToken) {
    console.warn('[TOKEN] User token exists but no login timestamp - user logged out, clearing token')
    userToken = undefined
  }
  
  // Fallback: Try to read directly from localStorage ONLY if store is missing AND timestamp exists
  // This handles edge cases where zustand persist hasn't synced yet
  // But we ONLY use it if there's a valid timestamp (user is logged in)
  if (!adminToken && adminTime > 0 && typeof window !== 'undefined') {
    try {
      const adminStorage = localStorage.getItem('admin_storage')
      if (adminStorage) {
        const parsed = JSON.parse(adminStorage)
        // Check both possible zustand persist formats
        if (parsed?.state?.admin_token) {
          adminToken = parsed.state.admin_token
          console.log('Retrieved admin_token from localStorage fallback (state format)')
        } else if (parsed?.admin_token) {
          adminToken = parsed.admin_token
          console.log('Retrieved admin_token from localStorage fallback (direct format)')
        }
      }
    } catch (e) {
      // Ignore parse errors
      console.warn('Failed to read admin_token from localStorage:', e)
    }
  }
  
  // Fallback: Try to read user token from localStorage ONLY if store is missing AND timestamp exists
  if (!userToken && userTime > 0 && typeof window !== 'undefined') {
    try {
      const userStorage = localStorage.getItem('user_storage')
      if (userStorage) {
        const parsed = JSON.parse(userStorage)
        // Check both possible zustand persist formats
        if (parsed?.state?.token) {
          userToken = parsed.state.token
          console.log('Retrieved user token from localStorage fallback (state format)')
        } else if (parsed?.token) {
          userToken = parsed.token
          console.log('Retrieved user token from localStorage fallback (direct format)')
        }
      }
    } catch (e) {
      // Ignore parse errors
      console.warn('Failed to read user token from localStorage:', e)
    }
  }

  // Token selection: Use token from the LAST login (admin or user)
  // IMPORTANT: Only use tokens that have a valid login timestamp (not logged out)
  let lastLoginType: 'admin' | 'user' | null = null
  let lastLoginTime = 0
  
  // Only consider tokens that have valid login timestamps (not logged out)
  // If a token exists but has no timestamp, it means the user logged out
  const adminHasValidLogin = adminToken && adminTime > 0
  const userHasValidLogin = userToken && userTime > 0
  
  if (adminHasValidLogin && userHasValidLogin) {
    // Both are logged in - use the most recent
    if (adminTime > userTime) {
      lastLoginType = 'admin'
      lastLoginTime = adminTime
    } else {
      lastLoginType = 'user'
      lastLoginTime = userTime
    }
  } else if (adminHasValidLogin) {
    // Only admin is logged in
    lastLoginType = 'admin'
    lastLoginTime = adminTime
  } else if (userHasValidLogin) {
    // Only user is logged in
    lastLoginType = 'user'
    lastLoginTime = userTime
  }
  // If neither has a valid login timestamp, lastLoginType remains null
  
  // Use token from last login for ALL API calls
  const urlStr = String(config.url || '')
  let token: string | undefined = undefined
  
  if (urlStr.includes('/api/')) {
    // For all API calls, use token from the last login (only if valid)
    if (lastLoginType === 'admin' && adminToken) {
      token = adminToken
      console.log('[TOKEN] Using ADMIN token (last login) for API call:', {
        url: urlStr.substring(0, 60),
        lastLoginType: 'admin',
        lastLoginTime: new Date(lastLoginTime).toISOString(),
        tokenLength: adminToken.length,
        tokenPreview: adminToken.substring(0, 20) + '...'
      })
    } else if (lastLoginType === 'user' && userToken) {
      token = userToken
      console.log('[TOKEN] Using USER token (last login) for API call:', {
        url: urlStr.substring(0, 60),
        lastLoginType: 'user',
        lastLoginTime: new Date(lastLoginTime).toISOString(),
        tokenLength: userToken.length,
        tokenPreview: userToken.substring(0, 20) + '...'
      })
    } else {
      // No valid login found - don't use any token
      console.error('[TOKEN ERROR] No valid login found! User may have logged out.', {
        url: urlStr.substring(0, 60),
        hasAdminToken: !!adminToken,
        hasUserToken: !!userToken,
        adminHasTimestamp: !!localStorage.getItem('admin_last_login_time'),
        userHasTimestamp: !!localStorage.getItem('user_last_login_time'),
        lastLoginType,
        'Note': 'If you logged out, this is expected. Please login again.'
      })
      token = undefined
    }
  } else {
    // Not an API call - no token needed
    token = undefined
  }

  // Debug logging for admin APIs
  if (isOnAdminPage || finalIsAdminApi) {
    console.log('Admin API Request:', {
      url: config.url,
      isOnAdminPage,
      isAdminApiByPath,
      urlContainsAdminApi,
      finalIsAdminApi,
      hasAdminToken: !!adminToken,
      hasUserToken: !!userToken,
      selectedToken: token ? 'admin' : (userToken ? 'user' : 'none')
    })
  }
  
  // Debug logging for regular APIs (especially chat endpoints)
  if (!finalIsAdminApi && config.url.includes('/api/chat/')) {
    console.log('Regular API Request (Chat):', {
      url: config.url,
      isOnAdminPage,
      hasAdminToken: !!adminToken,
      hasUserToken: !!userToken,
      selectedToken: token ? 'user' : 'none',
      tokenWillBeSent: !!token
    })
  }

  // Create headers object, ensuring we can set custom properties
  const headers: Record<string, string> = {}
  
  // Copy existing headers first (but we'll override token later)
  if (config.options?.headers) {
    if (config.options.headers instanceof Headers) {
      config.options.headers.forEach((value, key) => {
        // Skip token header - we'll set it correctly below
        if (key.toLowerCase() !== 'token') {
          headers[key] = value
        }
      })
    } else if (Array.isArray(config.options.headers)) {
      // Array of [key, value] pairs
      config.options.headers.forEach(([key, value]) => {
        // Skip token header - we'll set it correctly below
        if (key.toLowerCase() !== 'token') {
          headers[key] = value
        }
      })
    } else {
      // Plain object - copy all except token
      const existingHeaders = config.options?.headers
      if (existingHeaders) {
        Object.keys(existingHeaders).forEach(key => {
          if (key.toLowerCase() !== 'token') {
            headers[key] = (existingHeaders as any)[key]
          }
        })
      }
    }
  }

  // CRITICAL: Set token header LAST to ensure it's correct
  // This overwrites any token that might have been in existing headers
  if (token) {
    headers.token = token
    console.log('[TOKEN SET] Token set in headers:', {
      url: urlStr.substring(0, 60),
      tokenType: urlStr.includes('/api/admin') ? 'ADMIN' : 'USER',
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + '...'
    })
  } else {
    // Remove token if it exists
    delete headers.token
    console.warn('[TOKEN MISSING] No token will be sent:', {
      url: urlStr.substring(0, 60),
      expectedType: urlStr.includes('/api/admin') ? 'ADMIN' : 'USER'
    })
  }
  
  // Final verification - ensure token matches the selected token from last login
  if (urlStr.includes('/api/') && token) {
    if (headers.token !== token) {
      console.error('[TOKEN ERROR] Token mismatch in headers! FORCING CORRECT TOKEN!', {
        url: urlStr.substring(0, 60),
        expected: token.substring(0, 20) + '...',
        actual: headers.token?.substring(0, 20) + '...',
        lastLoginType,
        'FORCING CORRECT TOKEN NOW': true
      })
      // FORCE correct token
      headers.token = token
    }
  }

  // Store the original URL in headers for response interceptor
  headers['x-original-url'] = config.url
  
  // Final verification log for debugging
  if (finalIsAdminApi || urlContainsAdminApi) {
    console.log('Final admin token verification:', {
      url: config.url.substring(0, 60),
      tokenInHeaders: !!headers.token,
      tokenLength: headers.token?.length || 0,
      tokenPreview: headers.token ? headers.token.substring(0, 20) + '...' : 'none',
      isAdminEndpoint: true
    })
  }

  // CRITICAL: Never modify the URL - it must remain exactly as passed in
  // The URL determines which token to use, so changing it would break authentication
  const finalUrl = config.url
  
  // Verify URL hasn't been modified for admin endpoints
  if (incomingUrl && incomingUrl.includes('/api/admin') && !finalUrl.includes('/api/admin')) {
    console.error('🚨 CRITICAL: Admin URL was modified!', {
      original: incomingUrl,
      modified: finalUrl,
      'This should never happen!': 'URL must not be changed'
    })
    // Restore the original URL if it was somehow modified
    // This is a safety check - the URL should never be modified
  }
  
  const options: RequestInit & { url?: string } = {
    ...config.options,
    credentials: finalIsAdminApi ? 'omit' : config.options?.credentials ?? 'same-origin',
    headers,
    // Also store URL in options for easy access in response interceptor
    // IMPORTANT: Store the original URL, not a modified version
    url: finalUrl
  }

  return { ...options }
}

// Response interceptor
const interceptorsResponse = async <T>(options: any, response: any): Promise<ResponseData<T>> => {
  console.log('Response interceptor:', options, response)
  
  // Check if this is a streaming response - don't process streaming responses
  const contentType = response.headers?.get?.('content-type') || ''
  if (contentType.includes('text/event-stream') || contentType.includes('stream')) {
    // This is a streaming response, return it as-is without processing
    return response as any
  }
  
  let data: ResponseData<T>
  
  try {
    data = await response.json()
  } catch (error) {
    // If JSON parsing fails, create a default response
    console.error('Failed to parse response as JSON:', error)
    data = {
      code: response.status === 200 ? 0 : response.status,
      data: {} as T,
      message: 'Failed to parse server response'
    }
    return data
  }

  if (!isResponseData(data)) {
    data = {
      code: response.status === 200 ? 0 : response.status,
      data: (data as any)?.data ? (data as any).data : data,
      message: ''
    }
  }

  // Only show error notification for non-zero error codes
  // code === 0 means success, so don't show error notification
  if (data.code && data.code !== 0) {
    // Get the original URL from multiple sources FIRST - be very thorough
    let originalUrl = ''
    if (options?.headers && (options.headers as any)?.['x-original-url']) {
      originalUrl = (options.headers as any)['x-original-url']
    } else if (options?.url) {
      originalUrl = options.url
    } else if ((options as any)?.url) {
      originalUrl = (options as any).url
    } else if (typeof options === 'string') {
      originalUrl = options
    }
    
    // Also check the response URL if available
    if (!originalUrl && response?.url) {
      originalUrl = response.url
    }
    
    const isAdminApi = isAdminEndpoint(originalUrl)
    
    // Get current pathname for page detection
    let currentPath = ''
    if (typeof window !== 'undefined') {
      currentPath = window.location.pathname || ''
    }
    
    const isOnAdminPage = currentPath.startsWith('/admin') && currentPath !== '/admin/login'
    
    // CRITICAL: Suppress ALL admin API errors when NOT on admin pages
    // This is the primary check - if it's an admin API and we're not on admin page, never show error
    if (isAdminApi && !isOnAdminPage) {
      // Silently suppress - don't show error, don't logout, just return
      // This handles all cases: page refresh, background requests, invalidated tokens, etc.
      return data
    }
    
    // Also suppress if error message indicates login/account issue and it's admin API
    if (isAdminApi && data.message && 
        (data.message.toLowerCase().includes('login') || 
         data.message.toLowerCase().includes('account') ||
         data.message.toLowerCase().includes('please login'))) {
      if (!isOnAdminPage) {
        // Not on admin page - suppress login-related errors
        return data
      }
    }
    
    let shouldShowError = true
    
    if (response.status === 401 && data.code === 4001) {
      // Get the token that was actually sent in this request
      const sentToken = (options?.headers as any)?.token || ''
      const currentAdminToken = adminStore.getState().admin_token
      const currentUserToken = userStore.getState().token
      
      if (isAdminApi) {
        // We're on admin page (since we already checked above)
        if (sentToken === currentAdminToken && currentAdminToken) {
          // On admin page with admin token - this is a real failure, logout admin
          adminStore.getState().adminLogout()
          // Show error since we're actively using admin panel
        } else {
          // On admin page but token mismatch - suppress error (might be stale request)
          shouldShowError = false
        }
      } else {
        // Regular user authentication failed - logout user
        // Only logout if the token sent was the user token
        if (sentToken === currentUserToken && currentUserToken) {
          userStore.getState().logout()
          chatStore.getState().clearChats()
        }
      }
    }
    
    // Additional safety check: if message contains "login" and it's admin API, suppress
    if (shouldShowError && isAdminApi && data.message && 
        (data.message.toLowerCase().includes('login') || data.message.toLowerCase().includes('account'))) {
      // Double-check we're on admin page
      if (!isOnAdminPage) {
        shouldShowError = false
      }
    }
    
    if (shouldShowError && data.message) {
      notification.error({
        message: 'Error',
        description: data.message ? data.message : 'Network request error',
        style: {
          top: 60,
          zIndex: 1011
        }
      })
    }
  }
  return data
}

// Error interceptor
const interceptorsErrorResponse = async (data: ResponseData<any>) => {
  // Only show notification for network errors, not for API errors (those are handled by forms)
  if (data.code === 504 || data.message?.includes('Network error') || data.message?.includes('timeout')) {
    notification.error({
      message: 'Network Error',
      description: data.message ? data.message : 'Network request error',
      style: {
        top: 60,
        zIndex: 1011
      }
    })
  }
}

// Request
const request = <T>(
  url: string,
  options?: RequestInit | { [key: string]: any },
  config?: RequestConfig
): Promise<ResponseData<T>> => {
  // Timeout duration
  const { timeout = 15000 } = config || {}
  let timeoutId: string | number | NodeJS.Timeout | null | undefined = null

  if (typeof url !== 'string') throw new TypeError('url must be required and of string type!')
  
  // Log original URL for debugging
  const originalUrl = url
  url = getBaseUrl(url)
  
  // Log URL transformation for admin endpoints
  if (originalUrl.includes('/api/admin')) {
    console.log('🔍 URL Tracking - Admin API:', {
      original: originalUrl,
      afterGetBaseUrl: url,
      isAdminPath: originalUrl.includes('/api/admin')
    })
  }

  const controller = new AbortController()
  const signal = controller.signal

  options = {
    method: 'GET',
    // Request controller
    signal,
    ...options,
    headers: correctHeaders(options?.method, options?.headers)
  }

  // Import request interceptor
  options = interceptorsRequest({
    url,
    options
  })
  
  // Log final URL before fetch for admin endpoints
  if (originalUrl.includes('/api/admin')) {
    console.log('🔍 URL Tracking - Before fetch:', {
      original: originalUrl,
      finalUrl: url,
      urlInOptions: (options as any)?.url,
      urlInHeaders: (options.headers as any)?.['x-original-url']
    })
  }

  // Timeout handling
  const timeoutPromise = (timeout: number): Promise<ResponseData<any>> => {
    if (timeout <= 0) {
      return new Promise(() => {
        // ======= Waiting =======
      })
    }
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        console.warn(`Request timeout after ${timeout}ms for: ${url}`)
        const data = { code: 504, data: [], message: 'Request timeout, please try again later.' }
        interceptorsErrorResponse(data)
        controller.abort()
        resolve(data)
      }, timeout)
    })
  }

  // Send request
  const fetchPromise: Promise<ResponseData<T>> = new Promise((resolve, reject) => {
    // Log the actual URL being sent to fetch for admin endpoints
    if (originalUrl.includes('/api/admin')) {
      console.log('🔍 Fetch - Actual URL being sent:', {
        originalUrl,
        fetchUrl: url,
        method: options.method || 'GET'
      })
    }
    
    fetch(url, options)
      .then(async (res) => {
        const response = await interceptorsResponse<T>(
          {
            url: url, // Ensure URL is passed to response interceptor
            options: {
              ...options,
              url: url // Also store in options for easy access
            }
          },
          res
        )
        await resolve(response)
      })
      .catch(async (error) => {
        if (error.name === 'AbortError') {
          // Request was aborted (likely due to timeout)
          // The timeout promise will resolve, so we don't need to do anything here
          console.log('Request aborted:', url)
          return
        }
        console.error('Request error:', error)
        const data = { code: 504, data: error, message: 'Network error, please try again later.' }
        await interceptorsErrorResponse(data)
        await reject(data)
      })
      .finally(() => {
        timeoutId && clearTimeout(timeoutId)
      })
  })

  return Promise.race([timeoutPromise(timeout), fetchPromise])
}

const get = <T = unknown>(
  url: string,
  params: { [key: string]: any } | string = '',
  headers?: HeadersInit,
  config?: RequestConfig
) => {
  if (params && typeof params !== 'string' && isPlainObject(params)) {
    const tempArray: string[] = []
    for (const item in params) {
      if (item) {
        tempArray.push(`${item}=${params[item]}`)
      }
    }
    params = url.includes('?') ? tempArray.join('&') : `?${tempArray.join('&')}`
  }

  return request<T>(
    `${url}${params}`,
    {
      method: 'GET',
      headers
    },
    config
  )
}

const post = <T = unknown>(
  url: string,
  data?: { [key: string]: any } | string | any,
  headers?: HeadersInit,
  config?: RequestConfig
) => {
  let correctData = data
  if (isPlainObject(data)) {
    correctData = JSON.stringify(data)
  }
  return request<T>(
    url,
    {
      method: 'POST',
      headers,
      body: correctData
    },
    config
  )
}

const put = <T = unknown>(
  url: string,
  data?: { [key: string]: any } | string | any,
  headers?: HeadersInit,
  config?: RequestConfig
) => {
  let correctData = data
  if (isPlainObject(data)) {
    correctData = JSON.stringify(data)
  }
  return request<T>(
    url,
    {
      method: 'PUT',
      headers,
      body: correctData
    },
    config
  )
}

const del = <T = unknown>(
  url: string,
  params: { [key: string]: any } | string = '',
  headers?: HeadersInit,
  config?: RequestConfig
) => {
  if (params && typeof params !== 'string' && isPlainObject(params)) {
    const tempArray: string[] = []
    for (const item in params) {
      if (item) {
        tempArray.push(`${item}=${params[item]}`)
      }
    }
    params = url.includes('?') ? tempArray.join('&') : `?${tempArray.join('&')}`
  }

  return request<T>(
    `${url}${params}`,
    {
      method: 'DELETE',
      headers
    },
    config
  )
}

const postStreams = async <T>(
  url: string,
  data?: { [key: string]: any } | string | any,
  o?: {
    headers?: HeadersInit
    options?: { [key: string]: any }
  }
) => {
  const baseUrl = getBaseUrl(url)
  const options: { [key: string]: any } = interceptorsRequest({
    url,
    options: {
      method: 'POST',
      body: JSON.stringify(data),
      headers: correctHeaders('POST', o?.headers),
      ...o?.options
    }
  })
  
  try {
    const response = await fetch(baseUrl, options)
    
    // Check if response is ok (status 200-299)
    if (!response.ok) {
      // For non-ok responses, check content type
      const contentType = response.headers.get('Content-Type') || ''
      
      // For chat endpoints with errors, return error object
      if (url.includes('/api/chat/') && contentType.includes('application/json')) {
        try {
          const jsonData = await response.json()
          return {
            code: jsonData.code || response.status,
            data: jsonData.data || null,
            message: jsonData.message || 'Request exception, please try again later.'
          } as any
        } catch (e) {
          return {
            code: response.status,
            data: null,
            message: 'Request exception, please try again later.'
          } as any
        }
      }
    }
    
    // Check content type
    const contentType = response.headers.get('Content-Type') || ''
    
    // If it's a streaming response, return it directly without any processing
    if (contentType.includes('text/event-stream') || contentType.includes('stream')) {
      return response
    }
    
    // If it's JSON (likely an error response), handle it based on endpoint type
    if (contentType.includes('application/json')) {
      // For chat endpoints, check if it's an error and return error object
      // The chat code expects Response for streams OR error objects for errors
      if (url.includes('/api/chat/')) {
        // Clone response to read JSON without consuming the body
        const clonedResponse = response.clone()
        try {
          const jsonData = await clonedResponse.json()
          // If it's an error response (non-200 status or error code), return error object
          if (response.status !== 200 || (jsonData.code && jsonData.code !== 0)) {
            // Return error object that chat code can handle
            return {
              code: jsonData.code || response.status,
              data: jsonData.data || null,
              message: jsonData.message || 'Request exception, please try again later.'
            } as any
          }
          // If successful JSON (unlikely for chat), return response
          return response
        } catch (e) {
          // If JSON parsing fails, return response as-is
          return response
        }
      } else {
        // For non-chat endpoints, process through interceptor normally
        const responseJson = await interceptorsResponse<T>(
          {
            url,
            options
          },
          response
        )
        return responseJson
      }
    }
    
    // For other content types, return response as-is
    return response
  } catch (error: any) {
    // Network errors - return error object that chat code can handle
    console.error('Stream request error:', error)
    if (error.name === 'AbortError') {
      // Request was aborted - return error object
      return { code: -1, data: null, message: 'Request aborted' } as any
    }
    // Check if it's a fetch error with response (like 401)
    if (error.response) {
      try {
        const errorData = await error.response.json()
        return {
          code: errorData.code || error.response.status,
          data: errorData.data || null,
          message: errorData.message || 'Request exception, please try again later.'
        } as any
      } catch (e) {
        // If can't parse error response
        return {
          code: error.response.status || 500,
          data: null,
          message: 'Request exception, please try again later.'
        } as any
      }
    }
    // Other network errors
    return { code: 504, data: null, message: 'Network error, please try again later.' } as any
  }
}

export default {
  get,
  post,
  put,
  del,
  postStreams
}
