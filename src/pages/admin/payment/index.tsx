import {
  getAdminPayment,
  delAdminPayment,
  addAdminPayment,
  putAdminPayment
} from '@/request/adminApi'
import { AlipayInfo, HpjPayInfo, JsPayInfo, PaymentInfo, YipayInfo } from '@/types/admin'
import {
  ActionType,
  BetaSchemaForm,
  ModalForm,
  ProColumns,
  ProFormCheckbox,
  ProFormColumnsType,
  ProFormDependency,
  ProFormGroup,
  ProFormSegmented,
  ProFormText
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Button, Form, Space, Tag, message } from 'antd'
import { useRef, useState } from 'react'

type MIXInfo = PaymentInfo & AlipayInfo & YipayInfo & JsPayInfo & HpjPayInfo

function PaymentPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<MIXInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: PaymentInfo | undefined
  }>({
    open: false,
    info: undefined
  })

  const columns: ProColumns<PaymentInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: 'Channel Name',
      dataIndex: 'name'
    },
    {
      title: 'Channel Code',
      dataIndex: 'channel',
      render: (_, data) => <Tag>{data.channel}</Tag>
    },
    {
      title: 'Available Channels',
      dataIndex: 'types',
      width: 250,
      render: (_, data) => {
        const typesDom = data.types.split(',').map((type) => {
          return <Tag key={type}>{type}</Tag>
        })
        return <Space>{typesDom}</Space>
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (_, data) => (
        <Tag color={data.status ? 'green' : 'red'}>{data.status ? 'Online' : 'Offline'}</Tag>
      )
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
      width: 160,
      valueType: 'option',
      fixed: 'right',
      render: (_, data) => [
        <Button
          key="edit"
          type="link"
          onClick={() => {
            setEditInfoModal(() => {
              const json = JSON.parse(data.params)
              const types = data.types.split(',')
              form?.setFieldsValue({
                ...data,
                ...json,
                types
              })
              return {
                open: true,
                info: {
                  ...data,
                  ...json,
                  types
                }
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
            delAdminPayment({
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

  const payKeyColumns: { [key: string]: Array<ProFormColumnsType> } = {
    alipay: [
      {
        title: 'Alipay Face-to-Face Payment Configuration',
        valueType: 'group',
        columns: [
          {
            title: 'Application ID appId',
            dataIndex: 'appId',
            width: 'lg',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: 'This field is required'
                }
              ]
            }
          },
          {
            title: 'Encryption Type keyType',
            dataIndex: 'keyType',
            valueType: 'select',
            width: 's',
            request: async () => [
              {
                label: 'PKCS8',
                value: 'PKCS8'
              },
              {
                label: 'PKCS1',
                value: 'PKCS1'
              }
            ],
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: 'This field is required'
                }
              ]
            }
          }
        ]
      },
      {
        title: 'Application Private Key privateKey',
        dataIndex: 'privateKey',
        valueType: 'textarea',
        fieldProps: {
          autoSize: {
            minRows: 2,
            maxRows: 5
          }
        },
        formItemProps: {
          rules: [
            {
              required: true,
              message: 'This field is required'
            }
          ]
        }
      },
      {
        title: 'Alipay Public Key alipayPublicKey',
        dataIndex: 'alipayPublicKey',
        valueType: 'textarea',
        fieldProps: {
          autoSize: {
            minRows: 2,
            maxRows: 5
          }
        },
        formItemProps: {
          rules: [
            {
              required: true,
              message: 'This field is required'
            }
          ]
        }
      }
    ],
    yipay: [
      {
        title: 'Yipay Configuration',
        valueType: 'group',
        columns: [
          {
            title: 'Merchant ID',
            dataIndex: 'pid',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: 'This field is required'
                }
              ]
            },
            width: 'md'
          },
          {
            title: 'Merchant Key',
            dataIndex: 'key',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: 'This field is required'
                }
              ]
            },
            width: 'md'
          },
          {
            title: 'API Address',
            dataIndex: 'api',
            width: 'lg',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: 'This field is required'
                }
              ]
            }
          },
          {
            title: 'Return URL return_url',
            dataIndex: 'return_url',
            width: 'sm'
          }
        ]
      }
    ],
    jspay: [
      {
        title: 'PayJS Configuration',
        valueType: 'group',
        columns: [
          {
            title: 'Merchant ID',
            dataIndex: 'mchid',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: 'This field is required'
                }
              ]
            },
            width: 'md'
          },
          {
            title: 'Merchant Key',
            dataIndex: 'key',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: 'This field is required'
                }
              ]
            },
            width: 'md'
          },
          {
            title: 'API Address',
            dataIndex: 'api',
            width: 'lg',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: 'This field is required'
                }
              ]
            }
          },
          {
            title: 'Return URL return_url',
            dataIndex: 'return_url',
            width: 'sm'
          }
        ]
      }
    ],
    hpjpay: [
      {
        title: 'HPJPay Configuration',
        valueType: 'group',
        columns: [
          {
            title: 'Merchant ID',
            dataIndex: 'appid',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: 'This field is required'
                }
              ]
            },
            width: 'md'
          },
          {
            title: 'Merchant Key',
            dataIndex: 'key',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: 'This field is required'
                }
              ]
            },
            width: 'md'
          },
          {
            title: 'API Address',
            dataIndex: 'api',
            width: 'lg',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: 'Only need to fill in the domain name, e.g.: https://pay.wx.com',
                  pattern: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*[^\/]$/i
                }
              ]
            }
          },
          {
            title: 'Return URL return_url',
            dataIndex: 'return_url',
            width: 'sm'
          },
        ]
      }
    ]
  }

  function changeUpdateData(obj: MIXInfo) {
    const data = {
      name: obj.name,
      status: obj.status,
      channel: obj.channel,
      types: (obj.types as unknown as Array<string>).join(',')
    }
    if (obj.channel === 'alipay') {
      return {
        ...data,
        params: JSON.stringify({
          appId: obj?.appId,
          keyType: obj?.keyType,
          alipayPublicKey: obj?.alipayPublicKey,
          privateKey: obj?.privateKey
        })
      }
    } else if (obj.channel === 'yipay') {
      return {
        ...data,
        params: JSON.stringify({
          pid: obj?.pid,
          key: obj?.key,
          api: obj?.api,
          return_url: obj?.return_url
        })
      }
    } else if (obj.channel === 'jspay') {
      return {
        ...data,
        params: JSON.stringify({
          mchid: obj?.mchid,
          key: obj?.key,
          api: obj?.api,
          return_url: obj?.return_url
        })
      }
    } else if (obj.channel === 'hpjpay') {
      return {
        ...data,
        params: JSON.stringify({
          appid: obj?.appid,
          key: obj?.key,
          api: obj?.api,
          return_url: obj?.return_url
        })
      }
    } else {
      return false
    }
  }

  return (
    <div>
      <ProTable
        actionRef={tableActionRef}
        columns={columns}
        scroll={{
          x: 1400
        }}
        request={async (params, sorter, filter) => {
          // Form search items will be passed from params to the backend API.
          const res = await getAdminPayment({
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
                    info: undefined
                  }
                })
              }}
            >
              Add Payment Channel
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />

      <ModalForm<MIXInfo>
        title="Payment Channel Information"
        open={edidInfoModal.open}
        form={form}
        initialValues={{
          status: 1,
          channel: 'alipay'
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
          const data = changeUpdateData(values)
          if (!data) return false

          if (edidInfoModal.info?.id) {
            const res = await putAdminPayment({
              ...data,
              id: edidInfoModal.info?.id
            } as PaymentInfo)
            if (res.code) {
              message.error('Edit failed')
              return false
            }
            tableActionRef.current?.reload?.()
          } else {
            const res = await addAdminPayment(data as PaymentInfo)
            if (res.code) {
              message.error('Add failed')
              return false
            }
            tableActionRef.current?.reloadAndRest?.()
            message.success('Submitted successfully')
          }
          return true
        }}
        size="large"
        modalProps={{
          cancelText: 'Cancel',
          okText: 'Submit'
        }}
      >
        <ProFormText
          name="name"
          label="Channel Name"
          rules={[{ required: true, message: 'Please enter channel name' }]}
        />
        <ProFormGroup>
          <ProFormCheckbox.Group
            name="types"
            label="Available Channels"
            options={[
              {
                label: 'Alipay',
                value: 'alipay'
              },
              {
                label: 'WeChat Pay',
                value: 'wxpay'
              },
              {
                label: 'QQ Pay',
                value: 'qqpay'
              }
            ]}
            rules={[{ required: true, message: 'Please select available channels' }]}
            tooltip="For WeChat Pay and payment selection"
          />
          <ProFormSegmented
            name="status"
            label="Status"
            request={async () => [
              {
                label: 'Online',
                value: 1
              },
              {
                label: 'Offline',
                value: 0
              }
            ]}
            rules={[{ required: true, message: 'Please select status' }]}
          />
          <ProFormSegmented
            name="channel"
            label="Payment Provider"
            request={async () => [
              {
                label: 'Alipay In-person Payment',
                value: 'alipay'
              },
              {
                label: 'Yipay',
                value: 'yipay'
              },
              {
                label: 'PayJS',
                value: 'jspay'
              },
              {
                label: 'HPJPay',
                value: 'hpjpay'
              }
            ]}
            rules={[{ required: true, message: 'Please select payment provider' }]}
          />
        </ProFormGroup>
        <ProFormDependency name={['channel']}>
          {({ channel }) => {
            return <BetaSchemaForm layoutType="Embed" columns={payKeyColumns[channel]} />
          }}
        </ProFormDependency>
      </ModalForm>
    </div>
  )
}

export default PaymentPage
