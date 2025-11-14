import { delAdminMessage, getAdminMessages, putAdminMessage } from '@/request/adminApi'
import { MessageInfo } from '@/types/admin'
import { ActionType, ProColumns } from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Avatar, Button, Tag, message } from 'antd'
import { useRef, useState, useEffect } from 'react'
import moment from 'moment'
import useMobile from '@/hooks/useMobile'

function MessagePage() {
  const tableActionRef = useRef<ActionType>()
  const isMobile = useMobile()
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920)
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  const columns: ProColumns<MessageInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: isMobile ? 80 : 180,
      hideInTable: windowWidth < 576,
      ellipsis: true
    },
    {
      title: 'User Account',
      width: isMobile ? 120 : 180,
      dataIndex: 'user_id',
      ellipsis: true,
      render: (_, data) => {
        if (!data.user_id) return '-'
        return <p style={{ fontSize: isMobile ? 12 : 14, margin: 0 }}>{data.user?.account}</p>
      }
    },
    {
      title: 'Content',
      dataIndex: 'content',
      ellipsis: true,
      width: isMobile ? 150 : undefined
    },
    {
      title: 'AI Role',
      dataIndex: 'role',
      width: isMobile ? 80 : 130,
      render: (_, data) => (
        <Tag color={data.role.includes('user') ? 'cyan' : 'green'} style={{ fontSize: isMobile ? 11 : 12 }}>
          {isMobile ? data.role.substring(0, 4) : data.role}
        </Tag>
      )
    },
    // {
    //   title: 'Built-in AI Persona',
    //   dataIndex: 'persona_id',
    //   width: 130,
    //   render: (_, data) => {
    //     if (!data.persona || !data.persona_id) {
    //       return <span>-</span>
    //     }
    //     return (
    //       <div
    //         style={{
    //           display: 'inline-flex',
    //           alignItems: 'center',
    //           background: '#f5f5f5',
    //           padding: 4,
    //           borderRadius: 4
    //         }}
    //       >
    //         <Avatar src={data.persona.avatar} size={24} />
    //         <span>{data.persona.title}</span>
    //       </div>
    //     )
    //   }
    // },
    // {
    //   title: 'AI Plugin',
    //   dataIndex: 'plugin_id',
    //   width: 150,
    //   render: (_, data) => {
    //     if (!data.plugin_id || !data.plugin) {
    //       return <span>-</span>
    //     }
    //     return (
    //       <div
    //         style={{
    //           textAlign: 'center',
    //           background: '#f5f5f5',
    //           padding: 4,
    //           borderRadius: 4
    //         }}
    //       >
    //         <img src={data.plugin.avatar} style={{
    //           width: 50,
    //           height: 'auto'
    //         }}
    //         />
    //         <p>{data.plugin.name}</p>
    //       </div>
    //     )
    //   }
    // },
    {
      title: 'Model',
      dataIndex: 'model',
      width: isMobile ? 100 : 180,
      hideInTable: windowWidth < 768,
      ellipsis: true,
      render: (_, data) => (
        <Tag color={data.model.includes('gpt-4') ? 'purple' : ''} style={{ fontSize: isMobile ? 11 : 12 }}>
          {isMobile ? data.model.substring(0, 8) : data.model}
        </Tag>
      )
    },
    {
      title: 'Session ID',
      dataIndex: 'parent_message_id',
      width: isMobile ? 100 : 300,
      hideInTable: windowWidth < 992,
      ellipsis: true,
      render: (_, data) => (
        <Tag style={{ fontSize: isMobile ? 10 : 12 }}>
          {isMobile ? data.parent_message_id.substring(0, 8) + '...' : data.parent_message_id}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: isMobile ? 70 : 100,
      render: (_, data) => (
        <Tag color={data.status ? 'green' : 'red'} style={{ fontSize: isMobile ? 11 : 12 }}>
          {data.status ? 'Visible' : 'Hidden'}
        </Tag>
      )
    },
    {
      title: 'Created At',
      width: isMobile ? 120 : 200,
      dataIndex: 'create_time',
      hideInTable: windowWidth < 1200,
      render: (_, data) => {
        return (
<div style={{ fontSize: isMobile ? 11 : 14 }}>
          {isMobile ? moment(data.create_time).format('MM-DD HH:mm') : moment(data.create_time).format('YYYY-MM-DD HH:mm')}
</div>
)
      }
    },
    {
      title: 'Updated At',
      width: isMobile ? 120 : 200,
      dataIndex: 'update_time',
      hideInTable: windowWidth < 1400,
      render: (_, data) => {
        return (
<div style={{ fontSize: isMobile ? 11 : 14 }}>
          {isMobile ? moment(data.update_time).format('MM-DD HH:mm') : moment(data.update_time).format('YYYY-MM-DD HH:mm')}
</div>
)
      }
    },
    {
      title: 'Actions',
      width: isMobile ? 100 : 160,
      valueType: 'option',
      fixed: isMobile ? 'right' : undefined,
      render: (_, data) => [
        <Button
          key="edit"
          type="link"
          size={isMobile ? 'small' : 'middle'}
          style={{ padding: isMobile ? '4px 8px' : undefined, fontSize: isMobile ? 12 : 14 }}
          onClick={async () => {
            try {
              const res = await putAdminMessage({
                ...data,
                id: data.id,
                status: Number(data.status) === 1 ? 0 : 1
              })
              if (res.code) {
                message.error(res.message || 'Update failed')
                return
              }
              message.success(res.message || 'Updated successfully')
              tableActionRef.current?.reload()
            } catch (error: any) {
              message.error(error.message || 'Update failed')
            }
          }}
        >
          {Number(data.status) ? 'Hide' : 'Show'}
        </Button>,
        <Button
          key="del"
          type="text"
          danger
          size={isMobile ? 'small' : 'middle'}
          style={{ padding: isMobile ? '4px 8px' : undefined, fontSize: isMobile ? 12 : 14 }}
          onClick={async () => {
            try {
              const res = await delAdminMessage({
                id: data.id
              })
              if (res.code) {
                message.error(res.message || 'Delete failed')
                return
              }
              message.success(res.message || 'Deleted successfully')
              tableActionRef.current?.reload()
            } catch (error: any) {
              message.error(error.message || 'Delete failed')
            }
          }}
        >
          {isMobile ? 'Del' : 'Delete'}
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
          x: isMobile ? 800 : 2200
        }}
        size={isMobile ? 'small' : 'middle'}
        request={async (params, sorter, filter) => {
          // Form search items will be passed from params to the backend API.
          const res = await getAdminMessages({
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
          actions: []
        }}
        rowKey="id"
        search={false}
        bordered
      />
    </div>
  )
}

export default MessagePage
