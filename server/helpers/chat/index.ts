import fetch from 'node-fetch'
import { Transform } from 'stream'
import { Response } from 'express'
import { handleChatData, httpBody } from '../../utils'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { HttpProxyAgent } from 'http-proxy-agent'

type AikeyInfo = {
  host: string
  key: string
}

// Get proxy agent from environment variables or config
function getProxyAgent(): HttpsProxyAgent<string> | HttpProxyAgent<string> | undefined {
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy
  if (httpsProxy) {
    try {
      const url = new URL(httpsProxy)
      console.log(`[Proxy] Using proxy: ${url.protocol}//${url.hostname}:${url.port}`)
      if (url.protocol === 'https:') {
        return new HttpsProxyAgent<string>(httpsProxy)
      } else {
        return new HttpProxyAgent<string>(httpsProxy)
      }
    } catch (error) {
      console.error('[Proxy Error] Invalid proxy URL:', httpsProxy, error)
      return undefined
    }
  } else {
    console.warn('[Proxy] No proxy configured. If you encounter geographic restrictions, set HTTPS_PROXY environment variable.')
  }
  return undefined
}

async function fetchChatCompletions(aikeyInfo: AikeyInfo, options: { [key: string]: any }, proxyAgent?: HttpsProxyAgent<string> | HttpProxyAgent<string>) {
  try {
    const fetchOptions: any = {
      method: 'POST',
      body: JSON.stringify({
        ...options
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aikeyInfo.key}`
      }
    }
    
    // Add proxy agent if available
    if (proxyAgent) {
      fetchOptions.agent = proxyAgent
    }
    
    const chat = await fetch(`${aikeyInfo.host}/v1/chat/completions`, fetchOptions)
    return chat
  } catch (error: any) {
    console.error('[Chat Fetch Error]', error)
    // Return a mock response object for error handling
    return {
      status: 500,
      json: async () => ({ error: { message: error.message || 'Network error', code: 'network_error' } }),
      headers: { get: () => null }
    } as any
  }
}

async function fetchChatFunction(
  aikeyInfo: AikeyInfo,
  options: {
    messages: Array<{ [key: string]: any }>
    functions: Array<{ [key: string]: any }>,
	model?: string
  },
  proxyAgent?: HttpsProxyAgent<string> | HttpProxyAgent<string>
) {
  try {
    const fetchOptions: any = {
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-5',
        stream: false,
        function_call: 'auto',
        ...options
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aikeyInfo.key}`
      }
    }
    
    // Add proxy agent if available
    if (proxyAgent) {
      fetchOptions.agent = proxyAgent
    }
    
    const chat = await fetch(`${aikeyInfo.host}/v1/chat/completions`, fetchOptions)
    if (chat.status !== 200) return false
    const json = await chat.json()
    const message = json.choices[0].message
    return message
  } catch (error) {
    return false
  }
}

async function streamChatCompletions(
  aikeyInfo: AikeyInfo,
  options: { [key: string]: any },
  res: Response,
  stopCallback: (content: string) => void,
  content?: {[key: string]: any}
) {
  try {
    // Get proxy agent from environment variables
    const proxyAgent = getProxyAgent()
    console.log(`[Chat Request] Model: ${options.model}, Using proxy: ${proxyAgent ? 'Yes' : 'No'}`)
    const chat = await fetchChatCompletions(aikeyInfo, options, proxyAgent)
    
    if (chat.status === 200 && chat.headers.get('content-type')?.includes('text/event-stream')) {
      // 想在这里打印数据
      let allContent = ''
      res.setHeader('Content-Type', 'text/event-stream;charset=utf-8')
      const jsonStream = new Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
          const bufferString = Buffer.from(chunk).toString()
          const listString = handleChatData(bufferString, {
            parentMessageId: 'assistantMessageId',
            content
          })

          const list = listString.split('\n\n')
          for (let i = 0; i < list.length; i++) {
            if (list[i]) {
              const jsonData = JSON.parse(list[i])
              if (jsonData.segment === 'stop') {
                stopCallback(allContent)
              } else {
                allContent += jsonData.content
              }
            }
          }
          callback(null, listString)
        }
      })
      chat.body?.pipe(jsonStream).pipe(res)
      return
    }
    
    // Handle non-200 status codes
    const errorData = await chat.json().catch(() => ({}))
    let errorMessage = 'Request exception, please try again later.'
    let shouldRetryWithoutStream = false
    
    // Handle specific OpenAI API errors
    if (errorData.error) {
      const errorCode = errorData.error.code || ''
      const errorType = errorData.error.type || ''
      const errorParam = errorData.error.param || ''
      const errorMsg = (errorData.error.message || '').toLowerCase()
      
      // Check if this is an organization verification error for streaming
      // More robust detection for various error message formats
      if (
        (errorCode === 'unsupported_value' && errorParam === 'stream') ||
        (errorMsg.includes('organization must be verified') && errorMsg.includes('stream')) ||
        (errorMsg.includes('verified to stream'))
      ) {
        console.log('[Stream Fallback] Organization not verified for streaming. Will retry without stream...')
        console.log('[Stream Fallback] Error details:', { code: errorCode, param: errorParam, message: errorData.error.message })
        shouldRetryWithoutStream = true
      } else if (errorCode === 'unsupported_country_region_territory' || errorType === 'request_forbidden') {
        const proxyConfigured = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
        if (!proxyConfigured) {
          console.error('[Geographic Restriction] Your country/region is blocked by OpenAI. No proxy configured!')
          console.error('[Geographic Restriction] Please configure a proxy by setting HTTPS_PROXY environment variable.')
          console.error('[Geographic Restriction] Example: HTTPS_PROXY=http://proxy-server:port')
          errorMessage = 'Your country/region is not supported by the API. Please configure a proxy/VPN. See server logs for instructions.'
        } else {
          console.error('[Geographic Restriction] Your country/region is blocked even with proxy configured.')
          console.error('[Geographic Restriction] Current proxy:', proxyConfigured)
          errorMessage = 'Your country/region is not supported by the API. The configured proxy may not be working. Please check your proxy settings.'
        }
      } else if (errorCode === 'invalid_api_key') {
        errorMessage = 'Invalid API key. Please contact the administrator.'
      } else if (errorCode === 'insufficient_quota') {
        errorMessage = 'API quota exceeded. Please contact the administrator.'
      } else if (errorCode === 'rate_limit_exceeded') {
        errorMessage = 'Rate limit exceeded. Please try again later.'
      } else if (errorData.error.message) {
        errorMessage = errorData.error.message
      }
    }
    
    // Retry without streaming if organization is not verified
    if (shouldRetryWithoutStream && options.stream) {
      console.log('[Stream Fallback] Attempting non-streaming request...')
      const nonStreamOptions = { ...options, stream: false }
      const nonStreamChat = await fetchChatCompletions(aikeyInfo, nonStreamOptions, proxyAgent)
      
      if (nonStreamChat.status === 200) {
        const jsonResponse = await nonStreamChat.json()
        const responseContent = jsonResponse.choices?.[0]?.message?.content || ''
        
        // Simulate streaming response for consistent frontend behavior
        res.setHeader('Content-Type', 'text/event-stream;charset=utf-8')
        
        const parentMessageId = content?.parentMessageId || 'assistantMessageId'
        const sendStreamResponse = () => {
          // Send start segment
          res.write(JSON.stringify({
            id: jsonResponse.id || 'assistant',
            role: 'assistant',
            segment: 'start',
            dateTime: new Date().toISOString(),
            content: '',
            parentMessageId,
            ...(content?.pluginInfo ? { pluginInfo: content.pluginInfo } : {})
          }) + '\n\n')
          
          // Send content in chunks to simulate streaming
          const chunkSize = 5
          for (let i = 0; i < responseContent.length; i += chunkSize) {
            const chunk = responseContent.substring(i, i + chunkSize)
            res.write(JSON.stringify({
              id: jsonResponse.id || 'assistant',
              role: 'assistant',
              segment: 'text',
              dateTime: new Date().toISOString(),
              content: chunk,
              parentMessageId
            }) + '\n\n')
          }
          
          // Send end segment
          res.write(JSON.stringify({
            id: jsonResponse.id || 'assistant',
            role: 'assistant',
            segment: 'stop',
            dateTime: new Date().toISOString(),
            content: '',
            parentMessageId
          }) + '\n\n')
          
          res.end()
          stopCallback(responseContent)
        }
        
        sendStreamResponse()
        console.log('[Stream Fallback] Non-streaming request successful!')
        return
      } else {
        const retryErrorData = await nonStreamChat.json().catch(() => ({}))
        errorMessage = retryErrorData.error?.message || 'Failed to complete request even without streaming.'
      }
    }
    
    res.status(chat.status).json(httpBody(-1, errorData, errorMessage))
  } catch (error: any) {
    console.error('[Chat Error]', error)
    res.status(500).json(httpBody(-1, { error: error.message || 'Unknown error' }, 'Request exception, please try again later.'))
  }
}

export {
  getProxyAgent
}

export default {
  fetchChatCompletions,
  streamChatCompletions,
  fetchChatFunction,
  getProxyAgent
}
