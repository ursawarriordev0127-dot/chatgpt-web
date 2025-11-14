import { AutoComplete, Button, Input } from 'antd'
import styles from './index.module.less'
import { SyncOutlined, ArrowUpOutlined, AudioOutlined } from '@ant-design/icons'
import { useMemo, useState, useRef, useEffect } from 'react'
import { promptStore } from '@/store'
import useDocumentResize from '@/hooks/useDocumentResize'

type Props = {
  onSend: (value: string) => void
  disabled?: boolean
  onStopFetch?: () => void
  clearMessage?: () => void
}

function AllInput(props: Props) {
  const [prompt, setPrompt] = useState('')
  const { localPrompt } = promptStore()
  const textAreaRef = useRef<any>(null)

  const bodyResize = useDocumentResize()
  
  // Disable spellcheck on the actual textarea element
  useEffect(() => {
    const disableSpellCheck = () => {
      // Find textarea within the allInput container
      const container = document.querySelector(`.${styles.allInput}`)
      if (container) {
        const textarea = container.querySelector('textarea') as HTMLTextAreaElement
        if (textarea) {
          textarea.spellcheck = false
          textarea.setAttribute('spellcheck', 'false')
          textarea.setAttribute('autocomplete', 'off')
          textarea.setAttribute('autocorrect', 'off')
          textarea.setAttribute('autocapitalize', 'off')
        }
      }
    }
    
    disableSpellCheck()
    const timer = setTimeout(() => disableSpellCheck(), 50)
    return () => clearTimeout(timer)
  }, [prompt])

  const searchOptions = useMemo(() => {
    if (prompt.startsWith('/')) {
      return localPrompt
        .filter((item: { key: string }) =>
          item.key.toLowerCase().includes(prompt.substring(1).toLowerCase())
        )
        .map((obj) => {
          return {
            label: obj.key,
            value: obj.value
          }
        })
    } else {
      return []
    }
  }, [prompt])

  const handleSend = () => {
    if (prompt && !props.disabled) {
      props?.onSend?.(prompt)
      setPrompt('')
    }
  }

  return (
    <div className={styles.allInput}>
      <div className={styles.inputWrapper}>
        <AutoComplete
          value={prompt}
          options={searchOptions}
          className={styles.autoComplete}
          dropdownMatchSelectWidth={true}
          onSelect={(value) => {
            setPrompt(value)
          }}
        >
          <Input.TextArea
            value={prompt}
            size="large"
            placeholder="How can I help you today?"
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            autoSize={{
              minRows: 3,
              maxRows: 3
            }}
            onPressEnter={(e) => {
              if (e.key === 'Enter' && e.keyCode === 13 && e.shiftKey) {
                // === No operation ===
              } else if (e.key === 'Enter' && e.keyCode === 13 && bodyResize.width > 800) {
                handleSend()
                e.preventDefault()
              }
            }}
            onChange={(e) => {
              setPrompt(e.target.value)
            }}
            className={styles.textArea}
          />
        </AutoComplete>
        
        {props.disabled ? (
          <Button
            className={styles.stopButton}
            type="text"
            icon={<SyncOutlined spin />}
            onClick={() => {
              props.onStopFetch?.()
            }}
          />
        ) : (
          <Button
            className={`${styles.sendButton} ${prompt ? styles.sendButtonActive : ''}`}
            type="text"
            disabled={!prompt}
            icon={prompt ? <ArrowUpOutlined /> : <AudioOutlined />}
            onClick={handleSend}
          />
        )}
      </div>
    </div>
  )
}

export default AllInput
