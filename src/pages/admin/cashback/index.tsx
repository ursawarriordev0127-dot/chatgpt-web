import UserHead from '@/components/UserHead'
import { delAdminCashback, getAdminCashback, putAdminCashback, putAdminCashbackPass } from '@/request/adminApi'
import { CashbackInfo } from '@/types/admin'
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormDatePicker,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormGroup,
  ProFormRadio,
  ProFormText
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Tag, Button, Space, message, Form, Popconfirm } from 'antd'
import { useRef, useState } from 'react'

function UserPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<CashbackInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: CashbackInfo | undefined
  }>({
    open: false,
    info: undefined
  })
  const columns: ProColumns<CashbackInfo>[] = [
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
        if (data.status === 1) {
          return <Tag color="green">Issued Successfully</Tag>
        }
        return <Tag color="red">Abnormal Commission</Tag>
      }
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
    },
    {
      title: 'Consumer',
      dataIndex: 'user_id',
      width: 160,
      render: (_, data) => {
        return <Tag>{data?.user?.account || data?.user_id}</Tag>
      }
    },
    {
      title: 'Beneficiary',
      dataIndex: 'user_id',
      width: 160,
      render: (_, data) => {
        return <Tag>{data?.benefit?.account || data?.benefit_id}</Tag>
      }
    },
    {
      title: 'Payment Amount (cents)',
      dataIndex: 'pay_amount'
    },
    {
      title: 'Commission Amount (cents)',
      dataIndex: 'commission_amount'
    },
    {
      title: 'Commission Rate (%)',
      dataIndex: 'commission_rate'
    },
    {
      title: 'Related Order',
      width: 180,
      dataIndex: 'order_id'
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
              delAdminCashback({
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
              key="pass"
              placement="topRight"
              title="Payment Authenticity Verification"
              description="Please verify if this is a normal payment!"
              onConfirm={() => {
                putAdminCashbackPass({ id: data.id }).then((res) => {
                  if (res.code) return
                  message.success('Approved successfully')
                  tableActionRef.current?.reloadAndRest?.()
                })
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button
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
          const res = await getAdminCashback({
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
      <ModalForm<CashbackInfo>
        title="Commission Information"
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
          const res = await putAdminCashback({
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

export default UserPage
