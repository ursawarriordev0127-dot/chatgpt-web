import UserHead from '@/components/UserHead'
import { delAdminUsers, getAdminUsers, postAdminUser, putAdminUsers, getAdminAikeys } from '@/request/adminApi'
import { UserInfo, AikeyInfo } from '@/types/admin'
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormDatePicker,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormGroup,
  ProFormRadio,
  ProFormSelect,
  ProFormText
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Tag, Button, Space, message, Form } from 'antd'
import { useRef, useState, useEffect } from 'react'
import moment from 'moment'
import useMobile from '@/hooks/useMobile'

function UserPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<UserInfo>()
  const isMobile = useMobile()
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920)
  const [aikeyOptions, setAikeyOptions] = useState<Array<{ label: string; value: string | number }>>([])
  const [aikeyMap, setAikeyMap] = useState<Map<string | number, AikeyInfo>>(new Map())
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: UserInfo | undefined
  }>({
    open: false,
    info: undefined
  })
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Fetch API keys for the select field
  const fetchAikeys = async () => {
    try {
      const res = await getAdminAikeys({ page: 1, page_size: 1000 })
      if (!res.code && res.data?.rows) {
        const options = res.data.rows.map((aikey: AikeyInfo) => ({
          label: `${aikey.remarks || 'API Key'} (${aikey.host}) - ${aikey.models || 'No models'}`,
          value: aikey.id
        }))
        setAikeyOptions(options)
        
        // Create a map for quick lookup in table rendering
        const map = new Map<string | number, AikeyInfo>()
        res.data.rows.forEach((aikey: AikeyInfo) => {
          map.set(aikey.id, aikey)
        })
        setAikeyMap(map)
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error)
    }
  }
  
  // Load API keys on component mount
  useEffect(() => {
    fetchAikeys()
  }, [])
  
  const columns: ProColumns<UserInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: isMobile ? 80 : 180,
      hideInTable: windowWidth < 576,
      ellipsis: true
    },
    {
      title: 'Account',
      width: isMobile ? 120 : 200,
      dataIndex: 'account',
      ellipsis: true
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      width: isMobile ? 100 : 200,
      ellipsis: true,
      hideInTable: windowWidth < 768
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: isMobile ? 70 : 100,
      render: (_, data) => {
        return (
<Tag color="green" style={{ fontSize: isMobile ? 11 : 12 }}>
          {data.status === 1 ? 'Normal' : 'Abnormal'}
</Tag>
)
      }
    },
    {
      title: 'API Key',
      dataIndex: 'aikey_id',
      width: isMobile ? 100 : 200,
      ellipsis: true,
      hideInTable: windowWidth < 992,
      render: (_, data) => {
        if (!data.aikey_id) return <Tag style={{ fontSize: isMobile ? 11 : 12 }}>-</Tag>
        // Find the API key from map
        const aikey = aikeyMap.get(data.aikey_id)
        if (aikey) {
          const displayText = aikey.remarks || `Key ${aikey.id}`
          return (
            <Tag color="blue" title={`${displayText} - ${aikey.host} (${aikey.models || 'No models'})`} style={{ fontSize: isMobile ? 11 : 12 }}>
              {isMobile ? displayText.substring(0, 10) + '...' : displayText}
            </Tag>
          )
        }
        return <Tag color="blue" style={{ fontSize: isMobile ? 11 : 12 }}>ID: {data.aikey_id}</Tag>
      }
    },
    {
      title: 'Created At',
      dataIndex: 'create_time',
      width: isMobile ? 120 : '10%',
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
      dataIndex: 'update_time',
      width: isMobile ? 120 : '10%',
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
      width: isMobile ? 100 : 150,
      valueType: 'option',
      fixed: isMobile ? 'right' : undefined,
      render: (_, data) => [
        <Button
          key="edit"
          type="link"
          size={isMobile ? 'small' : 'middle'}
          style={{ padding: isMobile ? '4px 8px' : undefined, fontSize: isMobile ? 12 : 14 }}
          onClick={() => {
            setEditInfoModal(() => {
              form?.setFieldsValue({
                ...data
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
          size={isMobile ? 'small' : 'middle'}
          style={{ padding: isMobile ? '4px 8px' : undefined, fontSize: isMobile ? 12 : 14 }}
          onClick={async () => {
            try {
              const res = await delAdminUsers({
                id: data.id
              })
              if (res.code) {
                message.error(res.message || 'Delete failed')
                return
              }
              message.success('Deleted successfully')
              tableActionRef.current?.reloadAndRest?.()
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
        params={{}}
        pagination={{}}
        scroll={{
          x: isMobile ? 800 : 1400
        }}
        size={isMobile ? 'small' : 'middle'}
        request={async (params, sorter, filter) => {
          // Form search items will be passed from params to the backend API.
          const res = await getAdminUsers({
            page: params.current || 1,
            page_size: params.pageSize || 10
          })
          // Fetch API keys when table loads
          if (aikeyOptions.length === 0) {
            fetchAikeys()
          }
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
                    info: undefined
                  }
                })
              }}
            >
              Add User
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />
      <ModalForm<UserInfo>
        title="User Information"
        open={edidInfoModal.open}
        form={form}
        initialValues={{
          status: 1,
          role: 'user',
          integral: 0
        }}
        onOpenChange={(visible) => {
          if (!visible) {
            form.resetFields()
          } else {
            // Fetch API keys when modal opens
            fetchAikeys()
          }
          setEditInfoModal((info) => {
            return {
              ...info,
              open: visible
            }
          })
        }}
        onFinish={async (values) => {
          if (!edidInfoModal.info?.id) {
            const res = await postAdminUser({
				...values,
			})
			if (res.code) {
				message.error(res.message || 'Add failed')
				return false
			}
            message.success('Created successfully')
          } else {
            const res = await putAdminUsers({
              ...values,
              id: edidInfoModal.info?.id
            })
            if (res.code) {
              message.error(res.message || 'Edit failed')
              return false
            }
            message.success('Updated successfully')
          }
          tableActionRef.current?.reload?.()
          return true
        }}
        size={isMobile ? 'small' : 'large'}
        modalProps={{
          cancelText: 'Cancel',
          okText: 'Submit',
          width: isMobile ? '95%' : undefined,
          style: isMobile ? { top: 20 } : undefined
        }}
      >
        <ProFormGroup>
          <ProFormText
            width="md"
            name="account"
            label="User Account"
            rules={[{ required: true, message: 'Please enter user account' }]}
          />
          <ProFormRadio.Group
            name="role"
            label="Role"
            radioType="button"
            options={[
              {
                label: 'User',
                value: 'user'
              },
              {
                label: 'Administrator',
                value: 'administrator'
              }
            ]}
            rules={[{ required: true, message: 'Please enter remaining points' }]}
          />
          <ProFormRadio.Group
            name="status"
            label="Status"
            radioType="button"
            options={[
              {
                label: 'Abnormal',
                value: 0
              },
              {
                label: 'Normal',
                value: 1
              }
            ]}
            rules={[{ required: true, message: 'Please enter remaining points' }]}
          />
          <ProFormSelect
            name="aikey_id"
            label="API Key"
            placeholder="Select API Key (Optional)"
            options={aikeyOptions}
            fieldProps={{
              showSearch: true,
              allowClear: true,
              filterOption: (input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }}
          />
        </ProFormGroup>
        {/* <ProFormGroup>
          <ProFormText
            name="nickname"
            label="User Name"
            rules={[{ required: true, message: 'Please enter user name' }]}
          />
          <ProFormText
            name="avatar"
            label="User Avatar"
            rules={[{ required: true, message: 'Please enter user avatar' }]}
          />
          <ProFormText name="superior_id" label="Superior ID" />
        </ProFormGroup>

        <ProFormGroup>
          <ProFormDigit
            label="Remaining Points"
            name="integral"
            min={-1000000}
            max={1000000}
            rules={[{ required: true, message: 'Please enter remaining points' }]}
          />
          <ProFormDateTimePicker
            name="vip_expire_time"
            label="VIP Expiry Date"
            rules={[{ required: true, message: 'Please enter remaining points' }]}
          />
          <ProFormDateTimePicker
            name="svip_expire_time"
            label="Super VIP Expiry Date"
            rules={[{ required: true, message: 'Please enter remaining points' }]}
          />
        </ProFormGroup> */}
        {!edidInfoModal?.info?.id && (
          <ProFormText
            name="password"
            label="Default Password"
            rules={[{ required: true, message: 'Please enter default password' }]}
          />
        )}
      </ModalForm>
    </div>
  )
}

export default UserPage
