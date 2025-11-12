import {
  delAdminNotification,
  getAdminConfig,
  getAdminNotification,
  postAdminNotification,
  putAdminConfig,
  putAdminNotification
} from '@/request/adminApi'
import { ConfigInfo, NotificationInfo } from '@/types/admin'
import { ActionType, ProColumns } from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Button, Input, InputNumber, Modal, Radio, Space, Tag, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import FormCard from '../components/FormCard'
import RichEdit from '@/components/RichEdit'

function NotificationPage() {
  const [configs, setConfigs] = useState<Array<ConfigInfo>>([])
  const tableActionRef = useRef<ActionType>()

  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: NotificationInfo | undefined
  }>({
    open: false,
    info: undefined
  })

  const [edidContentModal, setEdidContentModal] = useState<{
    title?: string
    open: boolean
    key: string
    content: string
  }>({
    title: '',
    open: false,
    key: '',
    content: ''
  })


  const columns: ProColumns<NotificationInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: 'Title',
      width: 180,
      dataIndex: 'title'
    },
    {
      title: 'Sort',
      width: 180,
      dataIndex: 'sort',
      tooltip: 'Higher numbers are sorted later'
    },
    {
      title: 'Content',
      dataIndex: 'content',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      render: (_, data) => (
        <Tag color={data.status ? 'green' : 'red'}>{data.status ? 'Online' : 'Offline'}</Tag>
      )
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
            delAdminNotification({
              id: data.id
            }).then((res) => {
              if (res.code) return
              message.success('Deleted successfully')
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
          const res = await getAdminNotification({
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
                      title: '',
                      content: '',
                      status: 1,
                      sort: 1
                    } as any
                  }
                })
              }}
            >
              Add Notification
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />

      <Modal
        title="Notification Information"
        destroyOnClose
        width={600}
        open={edidInfoModal.open}
        onOk={() => {
          const { id, title, content, status, sort } = edidInfoModal.info || {}
          if (!edidInfoModal.info || !title || !content) {
            message.warning('Please add title and content')
            return
          }
          if (id) {
            // Edit
            putAdminNotification(edidInfoModal.info).then((res) => {
              if (res.code) return
              setEditInfoModal(() => {
                return {
                  open: false,
                  info: {
                    title: '',
                    content: '',
                    status: 1,
                    sort: 1
                  } as any
                }
              })
              tableActionRef.current?.reload()
            })
          } else {
            postAdminNotification({
              title,
              content,
              status,
              sort
            } as any).then((res) => {
              if (res.code) return
              setEditInfoModal(() => {
                return {
                  open: false,
                  info: {
                    title: '',
                    content: '',
                    status: 1,
                    sort: 1
                  } as any
                }
              })
              tableActionRef.current?.reload()
            })
          }
        }}
        onCancel={() => {
          setEditInfoModal({ open: false, info: undefined })
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <FormCard title="Title">
              <Input
                value={edidInfoModal.info?.title}
                placeholder="Notification title"
                onChange={(e) => {
                  setEditInfoModal((editInfo) => {
                    const info = { ...editInfo.info, title: e.target.value }
                    return {
                      ...editInfo,
                      info
                    } as any
                  })
                }}
              />
            </FormCard>
            <FormCard title="Sort">
              <InputNumber
                min={1}
                max={999999}
                defaultValue={edidInfoModal.info?.sort}
                value={edidInfoModal.info?.sort}
                placeholder="Sort"
                onChange={(value) => {
                  setEditInfoModal((editInfo) => {
                    const info = { ...editInfo.info, sort: value }
                    return {
                      ...editInfo,
                      info
                    } as any
                  })
                }}
              />
            </FormCard>
            <FormCard title="Status">
              <Radio.Group
                onChange={(e) => {
                  setEditInfoModal((editInfo) => {
                    const info = { ...editInfo.info, status: e.target.value }
                    return {
                      ...editInfo,
                      info
                    } as any
                  })
                }}
                defaultValue={edidInfoModal.info?.status}
                value={edidInfoModal.info?.status}
              >
                <Radio.Button value={1}>Online</Radio.Button>
                <Radio.Button value={0}>Offline</Radio.Button>
              </Radio.Group>
            </FormCard>
          </Space>
          <FormCard title="Notification Content">
            <RichEdit
              value={edidInfoModal.info?.content}
              onChange={(value) => {
                setEditInfoModal((editInfo) => {
                  const info = { ...editInfo.info, content: value }
                  return {
                    ...editInfo,
                    info
                  } as any
                })
              }}
            />
          </FormCard>
        </Space>
      </Modal>
    </div>
  )
}

export default NotificationPage
