import {
  getAdminProducts,
  delAdminProduct,
  postAdminProduct,
  putAdminProduct
} from '@/request/adminApi'
import { ProductInfo } from '@/types/admin'
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormDigit,
  ProFormGroup,
  ProFormRadio,
  ProFormText
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Button, Form, Tag, Tooltip, message } from 'antd'
import { useRef, useState } from 'react'

function ProductPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<ProductInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: ProductInfo | undefined
  }>({
    open: false,
    info: undefined
  })
  const columns: ProColumns<ProductInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: 'Title',
      dataIndex: 'title'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: (_, data) => {
        return <a>{data.price} cents</a>
      }
    },
    {
      title: 'Original Price',
      dataIndex: 'original_price',
      render: (_, data) => {
        return <a>{data.original_price} cents</a>
      }
    },
    {
      title: 'Points/Days',
      dataIndex: 'value',
      render: (_, data) => {
        return <a>{data.type === 'integral' ? data.value + ' points' : data.value + ' days'}</a>
      }
    },
    {
      title: 'Level',
      dataIndex: 'level',
      render: (_, data) => {
        if (data.level === 1) {
          return <Tag color="#f50">Regular Member</Tag>
        }
        if (data.level === 2) {
          return <Tag color="#ce9e4f">Super Member</Tag>
        }
        return <Tag>No Level</Tag>
      }
    },
    {
      title: 'Product Description',
      dataIndex: 'describe',
      ellipsis: {
        showTitle: false
      },
      render: (_, data) => <Tooltip title={data.describe}>{data.describe}</Tooltip>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (_, data) => (
        <Tag color={data.status ? 'green' : 'red'}>{data.status ? 'On Sale' : 'Off Sale'}</Tag>
      )
    },
    {
      title: 'Sort',
      dataIndex: 'sort',
      tooltip: 'Higher numbers are sorted later'
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
            delAdminProduct({
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
          x: 1200
        }}
        request={async (params, sorter, filter) => {
          // Form search items will be passed from params to the backend API.
          const res = await getAdminProducts({
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
              Add Product
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />
      <ModalForm<ProductInfo>
        title="Product Information"
        open={edidInfoModal.open}
        form={form}
        initialValues={{
          status: 1,
          level: 1,
          sort: 1
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
          if (edidInfoModal.info?.id) {
            console.log('Entering edit mode')
            const res = await putAdminProduct({
              ...data,
              id: edidInfoModal.info?.id
            })
            if (res.code) {
              message.error('Edit failed')
              return false
            }
            tableActionRef.current?.reload?.()
          } else {
            const res = await postAdminProduct(data)
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
        <ProFormGroup>
          <ProFormText
            width="md"
            name="title"
            label="Title"
            placeholder="Title"
            rules={[{ required: true, message: 'Please enter product title' }]}
          />
          <ProFormText
            width="xs"
            name="badge"
            label="Badge"
            placeholder="Badge"
            rules={[{ required: true, message: 'Please enter badge' }]}
          />
          <ProFormDigit
            width="xs"
            name="sort"
            label="Sort"
			tooltip="Higher numbers are sorted later"
            min={1}
            max={999999}
            placeholder="Sort"
            rules={[{ required: true }]}
          />
        </ProFormGroup>
        <ProFormText name="describe" label="Description" placeholder="Product description" />
        <ProFormGroup>
          <ProFormDigit
            label="Price (cents)"
            name="price"
            min={1}
            max={1000000}
            rules={[{ required: true, message: 'Please enter product price in cents' }]}
          />
          <ProFormDigit label="Original Price (cents)" name="original_price" min={0} max={1000000} />
          <ProFormRadio.Group
            name="status"
            label="Status"
            radioType="button"
            options={[
              {
                label: 'Off Sale',
                value: 0
              },
              {
                label: 'On Sale',
                value: 1
              }
            ]}
          />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormRadio.Group
            name="type"
            label="Reward Type"
            radioType="button"
            options={[
              {
                label: 'Points',
                value: 'integral'
              },
              {
                label: 'Days',
                value: 'day'
              }
            ]}
            rules={[{ required: true }]}
          />
          <ProFormDigit
            width="sm"
            label="Points/Days"
            name="value"
            min={0}
            max={1000000}
            rules={[{ required: true }]}
          />
          <ProFormRadio.Group
            name="level"
            label="Product Level"
            radioType="button"
            options={[
              {
                label: 'Regular Member',
                value: 1
              },
              {
                label: 'Super Member',
                value: 2
              }
            ]}
          />
        </ProFormGroup>
      </ModalForm>
    </div>
  )
}

export default ProductPage
