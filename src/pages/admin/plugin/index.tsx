import {
  getAdminPlugins,
  delAdminPlugin,
  postAdminPlugin,
  putAdminPlugin
} from '@/request/adminApi'
import { PluginInfo } from '@/types/admin'
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormDependency,
  ProFormDigit,
  ProFormGroup,
  ProFormList,
  ProFormRadio,
  ProFormText
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Avatar, Button, Form, Space, Tag, Tooltip, message } from 'antd'
import { useRef, useState } from 'react'
import FormCard from '../components/FormCard'
import { QuestionOutlined } from '@ant-design/icons'
import CodeEditor from '@/components/CodeEditor'

const functionJson = `{
	"name": "fun_name",
	"description": "fun_name description",
	"parameters": {
		"type": "object",
		"properties": {
			"ip": {
				"type": "string",
				"description": "ip address, eg:1.1.1.1"
			}
		},
		"required": [
			"ip"
		]
	}
}
`

const functionScript = `function fun_name(params) {
	const { ip } = params;
	console.log(ip);
}
`

function PluginPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<PluginInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: PluginInfo | undefined
  }>({
    open: false,
    info: undefined
  })

  const columns: ProColumns<PluginInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180,
      render: (_, data) => <a>{data.id}</a>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      render: (_, data) => {
        return (
          <Space>
            <img
              src={data.avatar}
              style={{
                width: 32
              }}
            />
            <span>{data.name}</span>
          </Space>
        )
      }
    },
    {
      title: 'Description',
      dataIndex: 'description'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (_, data) => {
        if (data.status === 4) {
          return <Tag color="orange">Pending Review</Tag>
        }
        return <Tag color={data.status ? 'green' : 'red'}>{data.status ? 'On Sale' : 'Off Sale'}</Tag>
      }
    },
    {
      title: 'Upload User',
      dataIndex: 'user_id',
      render: (_, data) => <a>{data.user?.account}</a>
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
                ...data,
                variables: data.variables ? JSON.parse(data.variables) : []
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
            delAdminPlugin({
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
          const res = await getAdminPlugins({
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
              Add Plugin
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />
      <ModalForm<PluginInfo>
        title="Plugin Information"
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
          if (!edidInfoModal.info?.script || !edidInfoModal.info?.function) {
            message.warning('Missing required parameters')
            return false
          }
          const data = {
            ...values,
            id: edidInfoModal.info?.id,
            script: edidInfoModal.info?.script,
            function: edidInfoModal.info?.function,
            variables: values.variables ? JSON.stringify(values.variables) : undefined
          }

          if (data?.id) {
            const res = await putAdminPlugin({
              ...data
            })
            if (res.code) {
              message.error('Edit failed')
              return false
            }
            tableActionRef.current?.reload?.()
          } else {
            const res = await postAdminPlugin(data)
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
          okText: 'Submit',
          style: {
            top: 10
          }
        }}
      >
        <ProFormGroup>
          <ProFormDependency name={['avatar']}>
            {({ avatar }) => {
              return (
                <FormCard title="Avatar" type="avatar">
                  {avatar ? (
                    <img
                      src={avatar}
                      style={{
                        width: '100%'
                      }}
                    />
                  ) : (
                    <QuestionOutlined />
                  )}
                </FormCard>
              )
            }}
          </ProFormDependency>
          <ProFormText
            width="md"
            name="avatar"
            label="Avatar Link"
            placeholder="Plugin avatar link"
            rules={[{ required: true, message: 'Please enter plugin avatar link' }]}
          />
          <ProFormText
            name="name"
            label="Name"
            placeholder="Plugin name"
            rules={[{ required: true, message: 'Please enter plugin name' }]}
          />
        </ProFormGroup>
        <ProFormText
          name="description"
          label="Description"
          placeholder="Plugin description"
          rules={[{ required: true, message: 'Please enter plugin description' }]}
        />
        <ProFormList
          name="variables"
          label="Environment Variables"
          creatorButtonProps={{
            creatorButtonText: 'Add Environment Variable'
          }}
        >
          <ProFormGroup key="group">
            <ProFormText name="label" label="Variable Name" rules={[{ required: true }]} />
            <ProFormText name="value" label="Variable Value" rules={[{ required: true }]} />
          </ProFormGroup>
        </ProFormList>
        <FormCard title="Plugin Function Description">
          <CodeEditor
            value={edidInfoModal.info?.function}
            defaultValue={functionJson}
            placeholder="Please enter JSON format"
            mode="json"
            onChange={(v) => {
              setEditInfoModal((modalInfo) => {
                const info = {
                  ...modalInfo.info,
                  function: v
                }
                return {
                  ...modalInfo,
                  info
                } as any
              })
            }}
          />
        </FormCard>
        <FormCard title="Plugin Function Script">
          <CodeEditor
            value={edidInfoModal.info?.script}
            defaultValue={functionScript}
            placeholder="Please enter JavaScript format code"
            mode="javascript"
            onChange={(v) => {
              setEditInfoModal((modalInfo) => {
                const info = {
                  ...modalInfo.info,
                  script: v
                }
                return {
                  ...modalInfo,
                  info
                } as any
              })
            }}
          />
        </FormCard>
        <ProFormGroup>
          <ProFormText name="user_id" label="User ID" placeholder="Plugin uploader's ID" />
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
              },
              {
                label: 'Under Review',
                value: 4
              }
            ]}
          />
        </ProFormGroup>
      </ModalForm>
    </div>
  )
}

export default PluginPage
