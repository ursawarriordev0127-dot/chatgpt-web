import { Button, Popconfirm, Space, Select, message } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import styles from './index.module.less'
import { chatStore, configStore, userStore } from '@/store'
import { chatAsync, configAsync } from '@/store/async'
import AllInput from './components/AllInput'
import ChatMessage from './components/ChatMessage'
import MessageItem from './components/MessageItem'
import { ChatGpt, RequestChatOptions } from '@/types'
import { postChatCompletions } from '@/request/api'
import Reminder from '@/components/Reminder'
import { filterObjectNull, formatTime, generateUUID, handleChatData } from '@/utils'
import { useScroll } from '@/hooks/useScroll'
import useDocumentResize from '@/hooks/useDocumentResize'
import Layout from '@/components/Layout'
import useMobile from '@/hooks/useMobile'

function ChatPage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { scrollToBottomIfAtBottom, scrollToBottom } = useScroll(scrollRef.current)
  const { token, setLoginModal } = userStore()
  const { config, models, changeConfig } = configStore()
  const {
    chats,
    addChat,
    clearChats,
    selectChatId,
    changeSelectChatId,
    setChatInfo,
    setChatDataInfo,
    delChatMessage
  } = chatStore()

  const isMobile = useMobile()

  const [fetchController, setFetchController] = useState<AbortController | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile) // Hidden on mobile by default, visible on desktop

  useLayoutEffect(() => {
    if (scrollRef) {
      scrollToBottom()
    }
  }, [scrollRef.current, selectChatId, chats])

  useEffect(() => {
    if (token) {
      chatAsync.fetchChatMessages()
    }
    // Always fetch config to ensure models are loaded
    configAsync.fetchConfig()
  }, [token])
  
  // Debug: Log models when they change
  useEffect(() => {
    console.log('[ChatPage] Models in store:', models.length, models)
  }, [models])

  const chatMessages = useMemo(() => {
    const chatList = chats.filter((c) => c.id === selectChatId)
    if (chatList.length <= 0) {
      return []
    }
    return chatList[0].data
  }, [selectChatId, chats])

  const CreateChat = () => {
    return (
      <Button
        block
        type="dashed"
        style={{
          marginBottom: 6,
          marginLeft: 0,
          marginRight: 0
        }}
        onClick={() => {
          addChat()
        }}
      >
        New Conversation
      </Button>
    )
  }

  // Server-side method integration
  async function serverChatCompletions({
    requestOptions,
    signal,
    userMessageId,
    assistantMessageId
  }: {
    userMessageId?: string
    signal: AbortSignal
    requestOptions: RequestChatOptions
    assistantMessageId: string
  }) {
    const response = await postChatCompletions(requestOptions, {
      options: {
        signal
      }
    })
      .then((res) => {
        return res
      })
      .catch((error) => {
        // Aborted: AbortError
        console.log(error.name)
      })

    if (!(response instanceof Response)) {
      // Error returned here ...
      if (userMessageId) {
        setChatDataInfo(selectChatId, userMessageId, {
          status: 'error'
        })
      }

      setChatDataInfo(selectChatId, assistantMessageId, {
        status: 'error',
        text: `${response?.message || '❌ Request exception, please try again later.'} \n \`\`\` ${JSON.stringify(response, null, 2)}   `
      })
      fetchController?.abort()
      setFetchController(null)
      message.error('Request failed')
      return
    }
    const reader = response.body?.getReader?.()
    let allContent = ''
    while (true) {
      const { done, value } = (await reader?.read()) || {}
      if (done) {
        fetchController?.abort()
        setFetchController(null)
        break
      }
      // Display the fetched data segments on screen
      const text = new TextDecoder('utf-8').decode(value)
      const texts = handleChatData(text)
      for (let i = 0; i < texts.length; i++) {
        const { dateTime, role, content, segment, pluginInfo } = texts[i]
        allContent += content ? content : ''
        if (segment === 'stop') {
          setFetchController(null)
          if (userMessageId) {
            setChatDataInfo(selectChatId, userMessageId, {
              status: 'pass'
            })
          }
          setChatDataInfo(selectChatId, assistantMessageId, {
            text: allContent,
            dateTime,
            status: 'pass'
          })
          break
        }

        if (segment === 'start') {
          if (userMessageId) {
            setChatDataInfo(selectChatId, userMessageId, {
              status: 'pass'
            })
          }
          setChatDataInfo(selectChatId, assistantMessageId, {
            text: allContent,
            dateTime,
            status: 'loading',
            role,
            requestOptions,
            plugin_info: pluginInfo || undefined
          })
        }
        if (segment === 'text') {
          setChatDataInfo(selectChatId, assistantMessageId, {
            text: allContent,
            dateTime,
            status: 'pass'
          })
        }
      }
      scrollToBottomIfAtBottom()
    }
  }

  // Conversation
  async function sendChatCompletions(vaule: string, refurbishOptions?: ChatGpt) {
    if (!token) {
      setLoginModal(true)
      return
    }
    const selectChat = chats.filter((c) => c.id === selectChatId)[0]
    const parentMessageId = refurbishOptions?.requestOptions.parentMessageId || selectChat.id
    let userMessageId = generateUUID()
    const requestOptions = {
      prompt: vaule,
      parentMessageId,
      persona_id: selectChat?.persona_id || refurbishOptions?.persona_id || '',
      options: filterObjectNull({
        ...config,
        ...refurbishOptions?.requestOptions.options
      })
    }
    const assistantMessageId = refurbishOptions?.id || generateUUID()
    if (refurbishOptions?.requestOptions.parentMessageId && refurbishOptions?.id) {
      userMessageId = ''
      setChatDataInfo(selectChatId, assistantMessageId, {
        status: 'loading',
        role: 'assistant',
        text: '',
        dateTime: formatTime(),
        requestOptions
      })
    } else {
      setChatInfo(selectChatId, {
        id: userMessageId,
        text: vaule,
        dateTime: formatTime(),
        status: 'pass',
        role: 'user',
        requestOptions
      })
      setChatInfo(selectChatId, {
        id: assistantMessageId,
        text: '',
        dateTime: formatTime(),
        status: 'loading',
        role: 'assistant',
        requestOptions
      })
    }

    const controller = new AbortController()
    const signal = controller.signal
    setFetchController(controller)
    serverChatCompletions({
      requestOptions,
      signal,
      userMessageId,
      assistantMessageId
    })
  }

  return (
    <div className={styles.chatPage}>
      <Layout
        collapsed={sidebarCollapsed}
        onCollapse={(collapsed) => setSidebarCollapsed(collapsed)}
        menuExtraRender={() => <CreateChat />}
        route={{
          path: '/',
          routes: chats
        }}
        menuDataRender={(item) => {
          return item
        }}
        menuItemRender={(item, dom) => (
          <MessageItem
            isSelect={item.id === selectChatId}
            isPersona={!!item.persona_id}
            name={item.name}
            onConfirm={() => {
              chatAsync.fetchDelUserMessages({ id: item.id, type: 'del' })
            }}
          />
        )}
        menuFooterRender={(props) => {
          return (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                size="middle"
                style={{ width: '100%' }}
                defaultValue={config.model}
                value={config.model}
                placeholder={models.length === 0 ? 'No models available' : 'Select AI Model'}
                notFoundContent={models.length === 0 ? 'No models available' : null}
                options={models.length > 0 ? models
                  .filter((m) => m && typeof m === 'object' && m.label && m.value && typeof m.label === 'string' && typeof m.value === 'string')
                  .map((m) => ({ 
                    label: 'AI Model: ' + String(m.label || m.value || ''),
                    value: String(m.value || '')
                  })) : []}
                onChange={(e) => {
                  changeConfig({
                    ...config,
                    model: e.toString()
                  })
                }}
              />
              <Popconfirm
                title="Delete All Conversations"
                description="Are you sure you want to delete all conversations? "
                onConfirm={() => {
                  if (token) {
                    chatAsync.fetchDelUserMessages({ type: 'delAll' })
                  } else {
                    clearChats()
                  }
                }}
                onCancel={() => {
                  // ==== No operation ====
                }}
                okText="Yes"
                cancelText="No"
              >
                <Button block danger type="dashed" ghost>
                  Clear All Conversations
                </Button>
              </Popconfirm>
            </Space>
          )
        }}
        menuProps={{
          onClick: (r) => {
            const id = r.key.replace('/', '')
            if (selectChatId !== id) {
              changeSelectChatId(id)
            }
            // Close sidebar on mobile when selecting a conversation
            if (isMobile) {
              setSidebarCollapsed(true)
            }
          }
        }}
      >
        {/* Mobile sidebar overlay - click outside to close */}
        {isMobile && !sidebarCollapsed && (
          <div 
            className={styles.mobileSidebarOverlay}
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
        {/* Mobile sidebar toggle button */}
        {isMobile && (
          <Button
            type="primary"
            shape="circle"
            icon={<MenuOutlined />}
            className={styles.mobileSidebarToggle}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Open Menu" : "Close Menu"}
          />
        )}
        <div className={styles.chatPage_container}>
          {/* {
            chatMessages[0]?.persona_id && <div className={styles.chatPage_container_persona}>Currently using preset persona conversation</div>
          } */}
          <div ref={scrollRef} className={styles.chatPage_container_one}>
            <div id="image-wrapper">
              {chatMessages.map((item) => {
                return (
                  <ChatMessage
                    key={item.id}
                    position={item.role === 'user' ? 'right' : 'left'}
                    status={item.status}
                    content={item.text}
                    time={item.dateTime}
                    model={item.requestOptions.options?.model}
                    onDelChatMessage={() => {
                      delChatMessage(selectChatId, item.id)
                    }}
                    onRefurbishChatMessage={() => {
                      console.log(item)
                      sendChatCompletions(item.requestOptions.prompt, item)
                    }}
                    pluginInfo={item.plugin_info}
                  />
                )
              })}
              {chatMessages.length <= 0 && <Reminder />}
              <div style={{ height: 250 }} />
            </div>
          </div>
          <div
            className={styles.chatPage_container_two}
            style={{
              position: isMobile ? 'fixed' : 'absolute'
            }}
          >
            <AllInput
              disabled={!!fetchController}
              onSend={(value) => {
                if (value.startsWith('/')) return
                sendChatCompletions(value)
                scrollToBottomIfAtBottom()
              }}
              clearMessage={() => {
                if (token) {
                  chatAsync.fetchDelUserMessages({ id: selectChatId, type: 'clear' })
                } else {
                  setLoginModal(true)
                }
              }}
              onStopFetch={() => {
                setFetchController((c) => {
                  c?.abort()
                  return null
                })
              }}
            />
          </div>
        </div>
      </Layout>
    </div>
  )
}
export default ChatPage
