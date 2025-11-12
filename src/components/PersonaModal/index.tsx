import { personaAsync } from '@/store/async'
import {
  Avatar,
  Badge,
  Button,
  Empty,
  Form,
  Input,
  Modal,
  Pagination,
  Popover,
  Space,
  Tag,
  message
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import styles from './index.module.less'
import personaStore from '@/store/persona/slice'
import { EyeOutlined, PlusCircleOutlined, QuestionOutlined } from '@ant-design/icons'
import { PersonaInfo } from '@/types'
import {
  ModalForm,
  ProFormDependency,
  ProFormGroup,
  ProFormList,
  ProFormSelect,
  ProFormText
} from '@ant-design/pro-components'
import { postPersona } from '@/request/api'
import { userStore } from '@/store'
import { getEmailPre } from '@/utils'
import AppCard from '../appCard'

type Props = {
  open: boolean
  onCreateChat: (item: PersonaInfo) => void
  onCancel: () => void
}

function PersonaModal(props: Props) {
  const { personas } = personaStore()
  const { token } = userStore()
  const [search, setSearch] = useState('')

  const [form] = Form.useForm<PersonaInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: PersonaInfo | undefined
    disabled: boolean
  }>({
    open: false,
    info: undefined,
    disabled: false
  })

  useEffect(() => {
    personaAsync.fetchPersonas()
  }, [])

  const countPersonas = useMemo(() => {
    if (search) {
      const list = personas.filter((item) => item.title.includes(search))
      return [...list]
    }
    return [...personas]
  }, [personas, search])

  return (
    <div className={styles.persona}>
      <Modal title="AI Persona" open={props.open} width={700} footer={null} onCancel={props.onCancel}>
        <Space size="small" direction="vertical" style={{ width: '100%' }}>
          <div className={styles.persona_operate}>
            <p>{personas.length} preset persona definitions</p>
            <Space wrap>
              <Button
                type="primary"
                disabled={!token}
                onClick={() => {
                  setEditInfoModal({
                    info: {
                      emoji: '1f970'
                    } as any,
                    open: true,
                    disabled: false
                  })
                }}
              >
                Add
              </Button>
              <Input
                placeholder="Search keywords"
                onChange={(e) => {
                  setSearch(e.target.value)
                }}
              />
            </Space>
          </div>
          <div className={styles.persona_list}>
            {countPersonas.map((item) => {
              return (
                <AppCard
                  key={item.id}
                  {...item}
                  userInfo={item.user}
                  message={`Contains ${JSON.parse(item.context).length} preset conversations`}
                  buttons={[
                    <p
                      key="duihua"
                      onClick={() => {
                        props.onCreateChat?.(item)
                      }}
                    >
                      <PlusCircleOutlined />
                      <span>Chat</span>
                    </p>,
                    <p
                      key="chakan"
                      onClick={() => {
                        setEditInfoModal(() => {
                          form.setFieldsValue({
                            ...item,
                            context: JSON.parse(item.context)
                          })
                          return {
                            open: true,
                            info: item,
                            disabled: true
                          }
                        })
                      }}
                    >
                      <EyeOutlined />
                      <span>View</span>
                    </p>
                  ]}
                />
              )
            })}
            <div className={styles.persona_list_empty}>
              {countPersonas.length <= 0 && (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" />
              )}
            </div>
          </div>
        </Space>
      </Modal>
      <ModalForm<PersonaInfo>
        title="Persona Information"
        open={edidInfoModal.open}
        form={form}
        initialValues={{
          status: 1
        }}
        onOpenChange={(visible) => {
          if (!visible) {
            form.resetFields()
          }
          setEditInfoModal((info) => {
            return {
              ...info,
              open: visible
            }
          })
        }}
        onFinish={async (values) => {
          if (edidInfoModal.disabled) {
            message.warning('Operation not allowed')
            return false
          }
          const data = { ...values }
          if (!data.context || data.context.length <= 0) {
            message.warning('Please fill in conversation data')
            return
          }
          const context = JSON.stringify(data.context)
          const res = await postPersona({
            ...data,
            context
          })
          if (res.code) {
            message.error('Submission failed')
            return false
          }
          message.success('Submitted successfully, please wait for review!')
          return true
        }}
        size="large"
        modalProps={{
          cancelText: 'Cancel',
          okText: 'Submit for Review'
        }}
      >
        <ProFormList
          name="context"
          creatorButtonProps={{
            creatorButtonText: 'Add a conversation line'
          }}
        >
          <ProFormGroup key="group">
            <ProFormSelect
              label="Role"
              name="role"
              width="sm"
              valueEnum={{
                system: 'system',
                user: 'user',
                assistant: 'assistant'
              }}
              rules={[{ required: true }]}
            />
            <ProFormText width="lg" rules={[{ required: true }]} name="content" label="Content" />
          </ProFormGroup>
        </ProFormList>
        <ProFormGroup>
          <ProFormDependency name={['avatar']}>
            {({ avatar }) => {
              return (
                <div className={styles.emojiForm}>
                  <div className={styles.emojiForm_label}>
                    <label>Avatar</label>
                  </div>
                  <div className={styles.emojiForm_card}>
                    {avatar ? (
                      <img
                        src={avatar}
                        style={{
                          width: '100%'
                        }}
                      />
                    ) : (
                      <QuestionOutlined />
                    )}
                  </div>
                </div>
              )
            }}
          </ProFormDependency>
          <ProFormText
            width="md"
            name="avatar"
            label="Avatar URL"
            placeholder="Please enter avatar link address"
            rules={[{ required: true, message: 'Please enter avatar link address' }]}
          />
          <ProFormText
            name="title"
            label="Title"
            placeholder="Title"
            rules={[{ required: true, message: 'Please enter persona title' }]}
          />
        </ProFormGroup>
        <ProFormText name="description" label="Description" placeholder="Description" />
      </ModalForm>
    </div>
  )
}

export default PersonaModal
