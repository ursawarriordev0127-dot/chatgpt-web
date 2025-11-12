import { Avatar, Button, Form, Popover, Tag, message } from 'antd'
import { useRef, useState } from 'react'
import {
  delAdminPersona,
  getAdminPersonas,
  postAdminPersona,
  putAdminPersona
} from '@/request/adminApi'
import { DialogInfo, PersonaInfo } from '@/types/admin'
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormDependency,
  ProFormDigit,
  ProFormGroup,
  ProFormList,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { QuestionOutlined } from '@ant-design/icons'
import FormCard from '../components/FormCard'

function PersonaPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<PersonaInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: PersonaInfo | undefined
  }>({
    open: false,
    info: undefined
  })

  const columns: ProColumns<PersonaInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: 'Avatar/Title',
      width: 180,
      dataIndex: 'title',
      render: (_, data) => {
        return (
          <a
            onClick={() => {
              setEditInfoModal(() => {
                form.setFieldsValue({
                  ...data,
                  context: JSON.parse(data.context)
                })
                return {
                  open: true,
                  info: data
                }
              })
            }}
            style={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {data.avatar && <Avatar size={24} src={data.avatar} />}
            <span>{data.title}</span>
          </a>
        )
      }
    },
    {
      title: 'Built-in Scripts',
      dataIndex: 'context',
      render: (_, data) => {
        if (!data.context) return <span>-</span>
        const context = JSON.parse(data.context)
        return (
          <a
            onClick={() => {
              setEditInfoModal(() => {
                form.setFieldsValue({
                  ...data,
                  context: JSON.parse(data.context)
                })
                return {
                  open: true,
                  info: data
                }
              })
            }}
          >
            Contains <span style={{ color: 'red', fontWeight: 'bold' }}> {context.length} </span>
            preset conversations
          </a>
        )
      }
    },
    {
      title: 'Description',
      dataIndex: 'description'
    },
    {
      title: 'User',
      dataIndex: 'user_id',
      render: (_, data) => {
        if (!data.user_id) return '-'
        return <p>{data.user?.account}</p>
      }
    },
    {
      title: 'Status',
      width: 100,
      dataIndex: 'status',
      render: (_, data) => {
        if (data.status === 4) {
          return <Tag color="orange">Pending Review</Tag>
        }
        return <Tag color={data.status ? 'green' : 'red'}>{data.status ? 'Normal' : 'Hidden'}</Tag>
      }
    },
    {
      title: 'Created At',
      width: 200,
      dataIndex: 'create_time'
    },
    {
      title: 'Updated At',
      width: 200,
      dataIndex: 'update_time'
    },
    {
      title: 'Actions',
      width: 160,
      valueType: 'option',
      fixed: 'right',
      render: (_, data) => [
        <Button
          key="edit"
          type="link"
          onClick={() => {
            setEditInfoModal(() => {
              form.setFieldsValue({
                ...data,
                context: JSON.parse(data.context)
              })
              return {
                open: true,
                info: data
              }
            })
          }}
        >
          Edit
        </Button>,
        <Button
          key="del"
          type="text"
          danger
          onClick={() => {
            delAdminPersona({
              id: data.id
            }).then((res) => {
              if (res.code) return
              message.success(res.message)
              tableActionRef.current?.reload()
            })
          }}
        >
          Delete
        </Button>
      ]
    }
  ]

  return (
    <div>
      <ProTable
        actionRef={tableActionRef}
        columns={columns}
        scroll={{
          x: 1600
        }}
        request={async (params, sorter, filter) => {
          // Form search items will be passed from params to the backend API.
          const res = await getAdminPersonas({
            page: params.current || 1,
            page_size: params.pageSize || 10
          })
          return Promise.resolve({
            data: res.data.rows,
            total: res.data.count,
            success: true
          })
        }}
        toolbar={{
          actions: [
            <Button
              key="primary"
              type="primary"
              size="small"
              onClick={() => {
                setEditInfoModal(() => {
                  return {
                    open: true,
                    info: {
                      emoji: '1f970'
                    } as any
                  }
                })
              }}
            >
              Add Persona
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />
      <ModalForm<PersonaInfo>
        title="Persona Information"
        open={edidInfoModal.open}
        form={form}
        initialValues={{
          status: 1,
          system: 0
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
          const data = { ...values }
          if (!data.context || data.context.length <= 0) {
            message.warning('Please fill in conversation data')
            return
          }
          const context = JSON.stringify(data.context)
          if (edidInfoModal.info?.id) {
            const res = await putAdminPersona({
              ...data,
              context,
              id: edidInfoModal.info?.id
            })
            if (res.code) {
              message.error('Edit failed')
              return false
            }
          } else {
            const res = await postAdminPersona({
              ...data,
              context
            })
            if (res.code) {
              message.error('Add failed')
              return false
            }
          }
          tableActionRef.current?.reloadAndRest?.()
          message.success('Submitted successfully')
          return true
        }}
        size="large"
        modalProps={{
          cancelText: 'Cancel',
          okText: 'Submit'
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
                <FormCard title="Avatar" type="avatar">
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
                </FormCard>
              )
            }}
          </ProFormDependency>
          <ProFormText
            width="md"
            name="avatar"
            label="Avatar Link"
            placeholder="Avatar link"
            rules={[{ required: true, message: 'Please enter avatar link' }]}
          />
          <ProFormText
            name="title"
            label="Title"
            placeholder="Title"
            rules={[{ required: true, message: 'Please enter persona title' }]}
          />
        </ProFormGroup>
        <ProFormText name="description" label="Description" placeholder="Description" />
        <ProFormGroup>
          <ProFormRadio.Group
            name="status"
            label="Status"
            radioType="button"
            options={[
              {
                label: 'Offline',
                value: 0
              },
              {
                label: 'Online',
                value: 1
              },
              {
                label: 'Under Review',
                value: 4
              }
            ]}
            rules={[{ required: true }]}
          />
          <ProFormRadio.Group
            name="system"
            label="Persona Level"
            radioType="button"
            options={[
              {
                label: 'User',
                value: 0
              },
              {
                label: 'System Level',
                value: 1
              }
            ]}
            rules={[{ required: true }]}
          />
          <ProFormText width="md" name="user_id" label="User ID" placeholder="User ID" />
        </ProFormGroup>
      </ModalForm>
    </div>
  )
}

export default PersonaPage
