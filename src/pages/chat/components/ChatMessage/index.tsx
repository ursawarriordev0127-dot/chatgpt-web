import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { copyToClipboard, joinTrim } from '@/utils'
import styles from './index.module.less'
import OpenAiLogo from '@/components/OpenAiLogo'
import { message, Dropdown } from 'antd'

import MarkdownIt from 'markdown-it'
import mdKatex from '@traptitech/markdown-it-katex'
import mila from 'markdown-it-link-attributes'
import hljs from 'highlight.js'
import { CopyOutlined, DeleteOutlined, MoreOutlined, RedoOutlined } from '@ant-design/icons'

// import smallLogo from '@/assets/small logo.jpeg'
// import avatarIcon from '@/assets/avatar.png'
import { PluginInfo } from '@/types'
import PluginCard from '@/components/PluginCard'

const dropdownItems = [
  {
    icon: <CopyOutlined />,
    label: 'Copy',
    key: 'copyout'
  },
  {
    icon: <RedoOutlined />,
    label: 'Retry',
    key: 'refurbish'
  },
  {
    icon: <DeleteOutlined />,
    label: 'Delete',
    key: 'delete'
  }
]

function screenDropdownItems(status: string, position: 'left' | 'right') {
  const newList = dropdownItems.filter((item) => {
    if (status !== 'error' && item.key === 'delete') {
      return false
    }

    if (position !== 'left' && item.key === 'refurbish') {
      return false
    }
    return true
  })

  return [...newList]
}

function ChatMessage({
  position,
  content,
  status,
  time,
  model,
  onDelChatMessage,
  onRefurbishChatMessage,
  pluginInfo
}: {
  position: 'left' | 'right'
  content?: string
  status: 'pass' | 'loading' | 'error' | string
  time: string
  model?: string
  onDelChatMessage?: () => void
  onRefurbishChatMessage?: () => void
  pluginInfo?: PluginInfo
}) {
  const copyMessageKey = 'copyMessageKey'
  const markdownBodyRef = useRef<HTMLDivElement>(null)

  function onCopyOut(text: string) {
    copyToClipboard(text)
      .then(() => {
        message.open({
          key: copyMessageKey,
          type: 'success',
          content: 'Copied successfully'
        })
      })
      .catch(() => {
        message.open({
          key: copyMessageKey,
          type: 'error',
          content: 'Copy failed'
        })
      })
  }

  function addCopyEvents() {
    if (markdownBodyRef.current) {
      const copyBtn = markdownBodyRef.current.querySelectorAll('.code-block-header__copy')
      copyBtn.forEach((btn) => {
        btn.addEventListener('click', () => {
          const code = btn.parentElement?.nextElementSibling?.textContent
          if (code) {
            onCopyOut(code)
          }
        })
      })
    }
  }

  function removeCopyEvents() {
    if (markdownBodyRef.current) {
      const copyBtn = markdownBodyRef.current.querySelectorAll('.code-block-header__copy')
      copyBtn.forEach((btn) => {
        btn.removeEventListener('click', () => {
          // ==== No operation needed ====
        })
      })
    }
  }

  function highlightBlock(str: string, lang: string, code: string) {
    return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy">Copy Code</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`
  }

  const mdi = new MarkdownIt({
    html: true,
    linkify: true,
    highlight(code, language) {
      const validLang = !!(language && hljs.getLanguage(language))
      if (validLang) {
        const lang = language ?? ''
        return highlightBlock(hljs.highlight(code, { language: lang }).value, lang, code)
      }
      return highlightBlock(hljs.highlightAuto(code).value, '', code)
    }
  })

  mdi.use(mila, { attrs: { target: '_blank', rel: 'noopener' } })
  mdi.use(mdKatex, { blockClass: 'katex-block', errorColor: ' #cc0000', output: 'mathml' })

  const renderText = useMemo(() => {
    const value = content || ''
    if (position === 'right') {
      return (
        <div ref={markdownBodyRef} className="markdown-body">
          {value}
        </div>
      )
    }
    const renderMdHtml = mdi.render(value)
    return (
      <div
        ref={markdownBodyRef}
        className="markdown-body"
        dangerouslySetInnerHTML={{
          __html: renderMdHtml
        }}
      />
    )
  }, [content, position])

  useLayoutEffect(() => {
    addCopyEvents()
    return () => {
      removeCopyEvents()
    }
  }, [markdownBodyRef.current, content])

  function chatAvatar({
    isShow,
    icon,
    style
  }: {
    isShow: boolean
    icon: string
    style?: React.CSSProperties
  }) {
    if (!isShow) return null
    return (
      <div
        className={styles.chatMessage_avatarCard}
        style={{
          ...style
        }}
      >
        <img src={icon} alt="" />
      </div>
    )
  }

  // Track if this message has been animated (only animate once)
  const [hasAnimated, setHasAnimated] = React.useState(false)
  
  React.useEffect(() => {
    // Mark as animated after first render
    if (!hasAnimated) {
      const timer = setTimeout(() => setHasAnimated(true), 200)
      return () => clearTimeout(timer)
    }
  }, [hasAnimated])

  return (
    <div
      className={styles.chatMessage}
      data-status={status}
      data-animated={hasAnimated ? 'true' : undefined}
      style={{
        justifyContent: position === 'right' ? 'flex-end' : 'flex-start'
      }}
    >
      {/* {useMemo(() => {
        return chatAvatar({
          style: { marginRight: 8 },
          isShow: position === 'left',
          icon: smallLogo
        })
      }, [])} */}
      <div className={styles.chatMessage_content}>
        {pluginInfo && <PluginCard {...pluginInfo} />}
        <div
          className={joinTrim([
            styles.chatMessage_content_text,
            position === 'right' ? styles.right : styles.left
          ])}
        >
          {status === 'loading' ? <OpenAiLogo rotate /> : renderText}
          <div
            className={styles.chatMessage_content_operate}
            style={{
              left: position === 'right' ? -20 : 'none',
              right: position === 'left' ? -20 : 'none'
            }}
          >
            <Dropdown
              placement="topRight"
              arrow={{
                pointAtCenter: true
              }}
              destroyPopupOnHide
              trigger={['click', 'hover']}
              menu={{
                items: [...screenDropdownItems(status, position)],
                onClick: ({ key }) => {
                  console.log(key)
                  if (key === 'delete') {
                    onDelChatMessage?.()
                  }

                  if (key === 'refurbish') {
                    onRefurbishChatMessage?.()
                  }

                  if (key === 'copyout' && content) {
                    onCopyOut(content)
                  }
                }
              }}
            >
              <div className={styles.chatMessage_content_operate_icon}>
                <MoreOutlined />
              </div>
            </Dropdown>
          </div>
        </div>
      </div>
      {/* {useMemo(() => {
        return chatAvatar({
          style: { marginLeft: 8 },
          isShow: position === 'right',
          icon: avatarIcon
        })
      }, [])} */}
    </div>
  )
}

export default ChatMessage
