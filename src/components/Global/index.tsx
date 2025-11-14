import { chatStore, configStore } from '@/store'
import { configAsync } from '@/store/async'
import { useEffect, useLayoutEffect } from 'react'
import LoginModal from '../LoginModal'
import ConfigModal from '../ConfigModal'
import { userStore } from '@/store'
import { notification, ConfigProvider } from 'antd'
import enUS from 'antd/locale/en_US'
import React from 'react'

type Props = {
  children: React.ReactElement
}

function Global(props: Props) {
  const { models, config, configModal, changeConfig, setConfigModal, notifications } = configStore()
  const { chats, addChat, changeSelectChatId } = chatStore()
  const { token, loginModal, setLoginModal } = userStore()

  const openNotification = ({
    key,
    title,
    content
  }: {
    key: string | number
    title: string
    content: string
  }) => {
    return notification.open({
      key,
      message: title,
      description: (
        <div
          dangerouslySetInnerHTML={{
            __html: content
          }}
        />
      ),
      onClick: () => {
        console.log('Notification Clicked!')
      }
    })
  }

  function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function onOpenNotifications() {
    for (const item of notifications) {
      await openNotification({
        key: item.id,
        title: item.title,
        content: item.content
      })
	  await delay(500)
    }
  }

  useEffect(() => {
    if (chats.length <= 0) {
      addChat()
    } else {
      const id = chats[0].id
      changeSelectChatId(id)
    }
	// Always fetch config to get latest models from database
	configAsync.fetchConfig()
  }, [])
  
  // Refresh models when token changes (user logs in/out)
  useEffect(() => {
    if (token) {
      // Refresh config to get latest models when user logs in
      configAsync.fetchConfig()
    }
  }, [token])

  useLayoutEffect(()=>{
	onOpenNotifications();
  },[notification])

  return (
    <ConfigProvider locale={enUS}>
      {props.children}
      <LoginModal
        open={loginModal}
        onCancel={() => {
          setLoginModal(false)
        }}
      />
      <ConfigModal
        open={configModal}
        onCancel={() => {
          setConfigModal(false)
        }}
        models={models}
        onChange={changeConfig}
        data={config}
      />
    </ConfigProvider>
  )
}
export default Global
