import { AutoComplete, Button, Input } from 'antd'
import styles from './index.module.less'
import { SyncOutlined, ArrowUpOutlined, AudioOutlined } from '@ant-design/icons'
import { useMemo, useState } from 'react'
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

  const bodyResize = useDocumentResize()

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
          onSelect={(value) => {
            setPrompt(value)
          }}
        >
          <Input.TextArea
            value={prompt}
            size="large"
            placeholder="How can I help you today?"
            autoSize={{
              minRows: 1,
              maxRows: 1
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
