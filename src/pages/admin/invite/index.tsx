import { delAdminInviteRecord, getAdminInviteRecord, putAdminInviteRecord, putAdminInviteRecordPass } from '@/request/adminApi'
import { InviteRecordInfo } from '@/types/admin'
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormGroup,
  ProFormRadio,
  ProFormText
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Tag, Button, message, Form, Popconfirm } from 'antd'
import { useRef, useState } from 'react'

function InviteRecordPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<InviteRecordInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: InviteRecordInfo | undefined
  }>({
    open: false,
    info: undefined
  })

  const columns: ProColumns<InviteRecordInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      render: (_, data) => {
        if (data.status === 3) {
          return <Tag color="orange">Pending Review</Tag>
        }
        if (data.status) {
          return <Tag color="green">Issued Successfully</Tag>
        }
        return <Tag color="red">Abnormal Status</Tag>
      }
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks'
    },
    {
      title: 'Inviter',
      dataIndex: 'superior_id',
      width: 200,
      render: (_, data) => {
        return <Tag>{data?.superior?.account || data?.superior_id}</Tag>
      }
    },
    {
      title: 'Invitee',
      dataIndex: 'user_id',
      width: 200,
      render: (_, data) => {
        return <Tag>{data?.user?.account || data?.user_id }</Tag>
      }
    },
    {
      title: 'Invitation Code',
      dataIndex: 'invite_code',
      render: (_, data) => {
        return <Tag>{data.invite_code}</Tag>
      }
    },
    {
      title: 'Reward',
      dataIndex: 'reward'
    },
    {
      title: 'ip',
      dataIndex: 'ip'
    },
    {
      title: 'Created At',
      dataIndex: 'create_time'
    },
    {
      title: 'Updated At',
      dataIndex: 'update_time'
    },
    {
      title: 'Actions',
      width: 220,
      valueType: 'option',
      fixed: 'right',
      render: (_, data) => {
        const buttons = [
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
            onClick={() => {
              delAdminInviteRecord({
                id: data.id
              }).then((res) => {
                if (res.code) return
                message.success('Deleted successfully')
                tableActionRef.current?.reloadAndRest?.()
              })
            }}
          >
            Delete
          </Button>,
        ]
        if (data.status !== 1) {
          buttons.push((
            <Popconfirm
              placement="topRight"
              title="Invitation Authenticity Verification"
              description="Please verify if this is a normal invitation. Once approved, rewards cannot be revoked!"
              onConfirm={() => {
                putAdminInviteRecordPass({ id: data.id }).then((res) => {
                  if (res.code) return
                  message.success('Approved successfully')
                  tableActionRef.current?.reloadAndRest?.()
                })
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button
                key="pass"
                type="link"
              >
                Approve
              </Button>
            </Popconfirm>
          ))
        }
        return [...buttons]
      }
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
          x: 1800
        }}
        request={async (params, sorter, filter) => {
          // Form search items will be passed from params to the backend API.
          const res = await getAdminInviteRecord({
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
            <Button key="allPass" size="small" danger onClick={() => {
              putAdminInviteRecordPass().then((res) => {
                if (res.code) return
                message.success('All approved successfully')
                tableActionRef.current?.reloadAndRest?.()
              })
            }}
            >
              Approve All
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />
      <ModalForm<InviteRecordInfo>
        title="Invitation Information"
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
          if (!edidInfoModal.info?.id) return false
          const res = await putAdminInviteRecord({
            ...values,
            id: edidInfoModal.info?.id
          })
          if (res.code) {
            message.error('Edit failed')
            return false
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
          <ProFormRadio.Group
            name="status"
            label="Status"
            radioType="button"
            options={[
              {
                label: 'Abnormal Status',
                value: 0
              },
              {
                label: 'Issued Normally',
                value: 1
              },
              {
                label: 'Under Review',
                value: 3
              }
            ]}
            rules={[{ required: true, message: 'Please select status' }]}
          />
          <ProFormText
            width="md"
            name="remarks"
            label="Remarks/Reminder"
            rules={[{ required: true, message: 'Please enter remarks/reminder information' }]}
          />
        </ProFormGroup>
      </ModalForm>
    </div>
  )
}

export default InviteRecordPage
