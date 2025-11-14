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
import moment from 'moment';

function UserPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<UserInfo>()
  const [aikeyOptions, setAikeyOptions] = useState<Array<{ label: string; value: string | number }>>([])
  const [aikeyMap, setAikeyMap] = useState<Map<string | number, AikeyInfo>>(new Map())
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: UserInfo | undefined
  }>({
    open: false,
    info: undefined
  })
  
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
      width: 180
    },
    {
      title: 'Account',
      width: 200,
      dataIndex: 'account'
    },
    // {
    //   title: 'Points',
    //   width: 100,
    //   dataIndex: 'integral',
    //   render: (_, data) => <a>{data.integral} points</a>
    // },
    // {
    //   title: 'VIP Expiry Time',
    //   dataIndex: 'vip_expire_time',
    //   render: (_, data) => {
    //     const today = new Date()
    //     const todayTime = today.getTime()
    //     const userSubscribeTime = new Date(data.vip_expire_time).getTime()
    //     return (
    //       <Space wrap>
    //         <Tag>{data.vip_expire_time}</Tag>
    //         {userSubscribeTime < todayTime && <Tag color="red">Expired</Tag>}
    //       </Space>
    //     )
    //   }
    // },
    // {
    //   title: 'Super VIP Expiry Time',
    //   dataIndex: 'svip_expire_time'
    // },
    // {
    //   title: 'User Info',
    //   dataIndex: 'user_id',
    //   width: 160,
    //   render: (_, data) => {
    //     return <UserHead headimgurl={data.avatar} nickname={data.nickname} />
    //   }
    // },
    {
      title: 'IP',
      dataIndex: 'ip',
      width: 200,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      render: (_, data) => {
        return <Tag color="green">{data.status === 1 ? 'Normal' : 'Abnormal'}</Tag>
      }
    },
    {
      title: 'API Key',
      dataIndex: 'aikey_id',
      width: 200,
      render: (_, data) => {
        if (!data.aikey_id) return <Tag>-</Tag>
        // Find the API key from map
        const aikey = aikeyMap.get(data.aikey_id)
        if (aikey) {
          const displayText = aikey.remarks || `Key ${aikey.id}`
          return (
            <Tag color="blue" title={`${displayText} - ${aikey.host} (${aikey.models || 'No models'})`}>
              {displayText}
            </Tag>
          )
        }
        return <Tag color="blue">ID: {data.aikey_id}</Tag>
      }
    },
    {
      title: 'Created At',
      dataIndex: 'create_time',
      width: "10%",
      render: (_, data) => {
        return <div>{moment(data.create_time).format('YYYY-MM-DD HH:mm')}</div>
      }
    },
    {
      title: 'Updated At',
      dataIndex: 'update_time',
      width: "10%",
      render: (_, data) => {
        return <div>{moment(data.update_time).format('YYYY-MM-DD HH:mm')}</div>
      }
    },
    {
      title: 'Actions',
      width: 150,
      valueType: 'option',
      // fixed: 'right',
      render: (_, data) => [
        <Button
          key="edit"
          type="link"
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
        params={{}}
        pagination={{}}
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
        size="large"
        modalProps={{
          cancelText: 'Cancel',
          okText: 'Submit'
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
