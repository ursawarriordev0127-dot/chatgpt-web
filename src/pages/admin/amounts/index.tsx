import UserHead from '@/components/UserHead'
import {
  delAdminAmountDetails,
  getAdminAmountDetails,
  putAdminAmountDetails,
  postAdminAmountDetails
} from '@/request/adminApi'
import { AmountDetailInfo, UserInfo } from '@/types/admin'
import { SecurityScanFilled } from '@ant-design/icons'
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
import { Tag, Button, Space, message, Form, Popover, Typography } from 'antd'
import { useRef, useState } from 'react'

function UserPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<AmountDetailInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: AmountDetailInfo | undefined
  }>({
    open: false,
    info: undefined
  })
  const columns: ProColumns<AmountDetailInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: 'Account',
      width: 200,
      dataIndex: 'user_id',
      render: (_, data) => {
        return (
          <Popover
            content={<Typography.Paragraph copyable>{data?.user_id}</Typography.Paragraph>}
            title="User ID"
          >
            <Tag>
              <SecurityScanFilled /> {data?.user?.account || data?.user_id}
            </Tag>
          </Popover>
        )
      }
    },
    {
      title: 'Original Amount (cents)',
      dataIndex: 'original_amount',
      render: (_, data) => {
        return <a>{data.original_amount} cents</a>
      }
    },
    {
      title: 'Operation Amount (cents)',
      dataIndex: 'operate_amount',
      render: (_, data) => {
        return (
          <a>{Number(data.operate_amount) > 0 ? `+${data.operate_amount} cents` : `${data.operate_amount} cents`}</a>
        )
      }
    },
    {
      title: 'Current Amount (cents)',
      dataIndex: 'current_amount',
      render: (_, data) => {
        return <a>{data.current_amount} cents</a>
      }
    },
    {
      title: 'Operation Type',
      dataIndex: 'type',
      render: (_, data) => {
        if (data.type === 'cashback') {
          return <Tag color="green">Subordinate Consumption Commission</Tag>
        }
        if (data.type === 'withdrawal') {
          return <Tag color="blue">Withdrawal</Tag>
        }
        return <Tag color="red">Abnormal</Tag>
      }
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks'
    },
    {
      title: 'Related Order Number',
      dataIndex: 'correlation_id'
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
      title: 'Created At',
      dataIndex: 'create_time'
    },
    {
      title: 'Updated At',
      dataIndex: 'update_time'
    },
    {
      title: 'Actions',
      width: 150,
      valueType: 'option',
      fixed: 'right',
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
          onClick={() => {
            delAdminAmountDetails({
              id: data.id
            }).then((res) => {
              if (res.code) return
              message.success('Deleted successfully')
              tableActionRef.current?.reloadAndRest?.()
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
        params={{}}
        pagination={{}}
        scroll={{
          x: 1800
        }}
        request={async (params, sorter, filter) => {
          // Form search items will be passed from params to the backend API.
          const res = await getAdminAmountDetails({
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
              key="add"
              size="small"
              type="primary"
              onClick={() => {
                setEditInfoModal({
                  open: true,
                  info: undefined
                })
              }}
            >
              Add Record
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />

      <ModalForm<AmountDetailInfo>
        title="Amount Detail Information"
        open={edidInfoModal.open}
        form={form}
        initialValues={{
          status: 1,
          type: 'cashback'
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
          if (edidInfoModal.info?.id) {
            const res = await putAdminAmountDetails({
              ...values,
              id: edidInfoModal.info?.id
            })
            if (res.code) {
              message.error('Edit failed')
              return false
            }
          } else {
			const res = await postAdminAmountDetails({
				...values,
			})
			if (res.code) {
				message.error('Add failed')
				return false
			}
		  }
		  message.success('Operation successful')
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
            tooltip="Hover over username to get it"
            name="user_id"
            label="User ID"
            rules={[{ required: true }]}
          />
          <ProFormText
            width="md"
            tooltip="Payment order number or withdrawal order number"
            name="correlation_id"
            label="Related Order Number"
            rules={[{ required: true }]}
          />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormDigit
            label="Previous Remaining Amount (cents)"
            name="original_amount"
            min={0}
            max={9999999}
            rules={[{ required: true }]}
          />
          <ProFormDigit
            label="Operation Amount (cents)"
            name="operate_amount"
            min={-9999999}
            max={9999999}
            rules={[{ required: true }]}
          />
          <ProFormDigit
            label="Current Remaining Amount (cents)"
            name="current_amount"
            min={0}
            max={9999999}
            rules={[{ required: true }]}
          />
        </ProFormGroup>
        <ProFormGroup>
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
            rules={[{ required: true }]}
          />
          <ProFormRadio.Group
            name="type"
            label="Operation Type"
            radioType="button"
            options={[
              {
                label: 'Subordinate Consumption Commission',
                value: 'cashback'
              },
              {
                label: 'Withdrawal',
                value: 'withdrawal'
              }
            ]}
            rules={[{ required: true }]}
          />
          <ProFormText
            width="md"
            name="remarks"
            label="Remarks"
            rules={[{ required: true, message: 'Remarks' }]}
          />
        </ProFormGroup>
      </ModalForm>
    </div>
  )
}

export default UserPage
