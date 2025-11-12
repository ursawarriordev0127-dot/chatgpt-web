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
      if (url.protocol === 'https:') {
        return new HttpsProxyAgent<string>(httpsProxy)
      } else {
        return new HttpProxyAgent<string>(httpsProxy)
      }
    } catch (error) {
      console.error('[Proxy Error] Invalid proxy URL:', httpsProxy, error)
      return undefined
    }
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
    
    // Handle specific OpenAI API errors
    if (errorData.error) {
      const errorCode = errorData.error.code || ''
      const errorType = errorData.error.type || ''
      
      if (errorCode === 'unsupported_country_region_territory' || errorType === 'request_forbidden') {
        errorMessage = 'Your country/region is not supported by the API. Please contact the administrator or use a VPN/proxy.'
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
