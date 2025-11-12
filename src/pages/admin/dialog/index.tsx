import { Button, Form, Tag, message } from 'antd'
import { useRef, useState } from 'react'
import {
  delAdminDialog,
  getAdminDialogs,
  postAdminDialog,
  putAdminDialog
} from '@/request/adminApi'
import { DialogInfo } from '@/types/admin'
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormDigit,
  ProFormGroup,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'

function DialogPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<
    DialogInfo & {
      models: Array<string>
    }
  >()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: DialogInfo | undefined
  }>({
    open: false,
    info: undefined
  })

  const columns: ProColumns<DialogInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: 'Question',
      width: 180,
      dataIndex: 'issue'
    },
    {
      title: 'Answer',
      dataIndex: 'answer'
    },
    {
      title: 'Applicable Models',
      width: 200,
      dataIndex: 'models',
      render: (_, data) => {
        if (!data.models) return '-'
        const modelTag = data.models.split(',').map((model) => {
          return <Tag key={model}>{model}</Tag>
        })
        return <>{modelTag}</>
      }
    },
    {
      title: 'Delay Time',
      width: 120,
      dataIndex: 'delay',
      render: (_, data) => (
        <Tag>{`Random 0-${data.delay}ms`}</Tag>
      )
    },
    {
      title: 'Status',
      width: 100,
      dataIndex: 'status',
      render: (_, data) => (
        <Tag color={data.status ? 'green' : 'red'}>{data.status ? 'Normal' : 'Hidden'}</Tag>
      )
    },
    {
      title: 'Created At',
      width: 200,
      dataIndex: 'create_time'
    },
    {
      title: 'Updated At',
      width: 200,
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
              const models = data.models ? data.models.split(',') : []
              form?.setFieldsValue({
                ...data,
                models
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
            delAdminDialog({
              id: data.id
            }).then((res) => {
              if (res.code) return
              message.success(res.message)
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
          const res = await getAdminDialogs({
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
              Add Conversation
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />
      <ModalForm<
        DialogInfo & {
          models: Array<string>
        }
      >
        title="Conversation Information"
        open={edidInfoModal.open}
        form={form}
        initialValues={{
          status: 1,
          level: 1,
          sort: 1,
          delay: 100
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
          const models = data.models.join(',')
          if (edidInfoModal.info?.id) {
            const res = await putAdminDialog({
              ...data,
              models,
              id: edidInfoModal.info?.id
            })
            if (res.code) {
              message.error('Edit failed')
              return false
            }
            tableActionRef.current?.reload?.()
          } else {
            const res = await postAdminDialog({
              ...data,
              models
            })
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
            width="lg"
            name="issue"
            label="Question"
            placeholder="Question"
            rules={[{ required: true, message: 'Please enter conversation question' }]}
          />
        </ProFormGroup>
        <ProFormTextArea
          name="answer"
          label="Answer"
          placeholder="Enter the correct answer to the question"
          fieldProps={{
            autoSize: {
              minRows: 2,
              maxRows: 6
            }
          }}
          rules={[{ required: true, message: 'Please enter answer' }]}
        />
        <ProFormGroup>
          <ProFormDigit
            label="Max Delay (ms)"
            name="delay"
            min={0}
            max={9999999}
            rules={[{ required: true }]}
          />
          <ProFormRadio.Group
            name="status"
            label="Status"
            radioType="button"
            options={[
              {
                label: 'Offline',
                value: 0
              },
              {
                label: 'Online',
                value: 1
              }
            ]}
            rules={[{ required: true }]}
          />
          <ProFormSelect
            name="models"
            label="Applicable Models"
            options={[
              {
                label: 'GPT-4',
                value: 'gpt-4'
              },
              {
                label: 'GPT-5',
                value: 'gpt-5'
              },
              {
                label: 'GPT-5 Mini',
                value: 'gpt-5-mini'
              }
            ]}
            fieldProps={{
              mode: 'multiple'
            }}
            placeholder="Please select AI models available for this conversation"
            rules={[
              {
                required: true,
                message: 'Please select AI models available for this conversation!'
              }
            ]}
          />
        </ProFormGroup>

      </ModalForm>
    </div>
  )
}

export default DialogPage
