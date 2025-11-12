import UserHead from '@/components/UserHead'
import {
  delAdminWithdrawalRecord,
  putAdminWithdrawalRecord,
  getAdminWithdrawalRecords,
  putAdminWithdrawalRecordOperate
} from '@/request/adminApi'
import { WithdrawalRecordInfo } from '@/types/admin'
import { transform } from '@/utils'
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
  ProFormText,
  ProFormTextArea
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Tag, Button, Space, message, Form, Typography, Popover, Descriptions } from 'antd'
import { useRef, useState } from 'react'

function UserPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<WithdrawalRecordInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: WithdrawalRecordInfo | undefined
  }>({
    open: false,
    info: undefined
  })

  const [optionInfoModal, setOptionInfoModal] = useState<{
    open: boolean
    info: WithdrawalRecordInfo | undefined
  }>({
    open: false,
    info: undefined
  })

  function getPayType(type: string) {
    switch (type) {
      case 'wxpay':
        return 'WeChat Pay'
      case 'qqpay':
        return 'QQ Pay'
      case 'alipay':
        return 'Alipay'
      default:
        return 'None'
    }
  }

  const columns: ProColumns<WithdrawalRecordInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: 'User Account',
      width: 180,
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
      title: 'Withdrawal Amount (cents)',
      dataIndex: 'amount',
      render: (_, data) => {
        return <Tag color="red">{data.amount} cents</Tag>
      }
    },
    {
      title: 'Withdrawal Information',
      render: (_, data) => {
        const payTypeText = getPayType(data.type)
        return (
          <Space wrap direction="vertical">
            <p>
              Payee Name: <Tag color="blue">{data.name}</Tag>
            </p>
            <p>
              Contact: <Tag color="cyan">{data.contact}</Tag>
            </p>
            <p>
              Payment Method: <Tag color="green">{payTypeText}</Tag>
            </p>
            <p>
              Account: <Tag color="gold">{data.account}</Tag>
            </p>
          </Space>
        )
      }
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
          return <Tag color="orange">Withdrawal Successful</Tag>
        }
        return <Tag color="red">Abnormal</Tag>
      }
    },
    {
      title: 'Remarks/Reply',
      dataIndex: 'remarks'
    },
    {
      title: 'User Message',
      dataIndex: 'message'
    },
    {
      title: 'ip',
      dataIndex: 'ip',
      render: (_, data) => {
        return <Tag>{data.ip}</Tag>
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
      width: 220,
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
            delAdminWithdrawalRecord({
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
        <Button
          key="option"
          type="text"
          danger
          disabled={data.status != 3}
          onClick={() => {
            setOptionInfoModal(() => {
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
          Actions
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
          const res = await getAdminWithdrawalRecords({
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
      <ModalForm<WithdrawalRecordInfo>
        title="Withdrawal Details"
        open={edidInfoModal.open}
        form={form}
        initialValues={{
          status: 1,
          type: 'alipay'
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
          const res = await putAdminWithdrawalRecord({
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
          <ProFormText
            tooltip="Hover over username to get it"
            name="user_id"
            label="User ID"
            rules={[{ required: true }]}
          />
          <ProFormText
            name="name"
            label="User Name"
            rules={[{ required: true, message: 'Please enter user name' }]}
          />
          <ProFormText
            name="contact"
            label="Contact"
            rules={[{ required: true, message: 'Please enter user contact' }]}
          />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormDigit
            label="Withdrawal Amount (cents)"
            name="amount"
            min={0}
            max={1000000}
            rules={[{ required: true }]}
          />
          <ProFormRadio.Group
            name="type"
            label="Payment Method"
            radioType="button"
            options={[
              {
                label: 'WeChat Pay',
                value: 'wxpay'
              },
              {
                label: 'QQ Pay',
                value: 'qqpay'
              },
              {
                label: 'Alipay',
                value: 'alipay'
              }
            ]}
            rules={[{ required: true }]}
          />
          <ProFormText name="account" label="Account" rules={[{ required: true }]} />
        </ProFormGroup>

        <ProFormGroup>
          <ProFormRadio.Group
            name="status"
            label="Status"
            radioType="button"
            disabled
            options={[
              {
                label: 'Abnormal',
                value: 0
              },
              {
                label: 'Withdrawal Successful',
                value: 1
              },
              {
                label: 'Pending Review',
                value: 3
              }
            ]}
            rules={[{ required: true }]}
          />
          <ProFormText width="md" name="remarks" label="Remarks/Reply" rules={[{ required: true }]} />
        </ProFormGroup>
        <ProFormTextArea
          fieldProps={{
            autoSize: {
              minRows: 2,
              maxRows: 2
            }
          }}
          name="message"
          label="User Message"
        />
      </ModalForm>
      <ModalForm<WithdrawalRecordInfo>
        title="Withdrawal Operation"
        open={optionInfoModal.open}
        form={form}
        initialValues={{
          status: 1
        }}
        onOpenChange={(visible) => {
          if (!visible) {
            form.resetFields()
          }
          setOptionInfoModal((info) => {
            return {
              ...info,
              open: visible
            }
          })
        }}
        onFinish={async (values) => {
          if (!optionInfoModal.info?.id) return false
          const res = await putAdminWithdrawalRecordOperate({
            ...values,
            status: values.new_status || 0,
            id: optionInfoModal.info?.id
          })
          if (res.code) {
            message.error('Operation failed')
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
        <Descriptions bordered size="small">
          <Descriptions.Item label="Name" span={2}>
            {optionInfoModal.info?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Contact" span={2}>
            {optionInfoModal.info?.contact}
          </Descriptions.Item>
          <Descriptions.Item label="Payment Method">{optionInfoModal.info?.type}</Descriptions.Item>
          <Descriptions.Item label="Account">{optionInfoModal.info?.account}</Descriptions.Item>
          <Descriptions.Item label="Withdrawal Amount">
            {transform.centToYuan(optionInfoModal.info?.amount)} yuan
          </Descriptions.Item>
          <Descriptions.Item label="User Message" span={3}>
            {optionInfoModal.info?.message}
          </Descriptions.Item>
        </Descriptions>
        <ProFormGroup>
          <ProFormRadio.Group
            name="new_status"
            label="Withdrawal Status"
            radioType="button"
            tooltip="Note: Changes cannot be reverted after modification"
            options={[
              {
                label: 'Abnormal',
                value: 0
              },
              {
                label: 'Withdrawal Successful',
                value: 1
              }
            ]}
            rules={[{ required: true }]}
          />
          <ProFormText width="lg" name="remarks" label="Remarks/Reply" rules={[{ required: true }]} />
        </ProFormGroup>
      </ModalForm>
    </div>
  )
}

export default UserPage
