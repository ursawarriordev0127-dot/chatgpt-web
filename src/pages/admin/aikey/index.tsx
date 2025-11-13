import {
  getAdminAikeys,
  delAdminAikey,
  putAdminAikey,
  postAdminAikey,
  postAdminAikeyCheck
} from '@/request/adminApi'
import { AikeyInfo } from '@/types/admin'
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormDependency,
  ProFormGroup,
  ProFormRadio,
  ProFormSegmented,
  ProFormSelect,
  ProFormText
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Button, Form, Progress, Space, Tag, message } from 'antd'
import { useRef, useState } from 'react'
import moment from 'moment'

const getModels = (type: string) => {
  if (type === 'stability') {
    return [
      {
        label: 'stable-diffusion-v1-5',
        value: 'stable-diffusion-v1-5'
      }
    ]
  }
  return [
    {
      label: 'OpenAI (dall-e) Drawing',
      value: 'dall-e'
    },
    {
      label: 'gpt-3.5-turbo',
      value: 'gpt-3.5-turbo'
    },
    {
      label: 'gpt-3.5-turbo-16k',
      value: 'gpt-3.5-turbo-16k'
    },
    {
      label: 'gpt-3.5-turbo-0613',
      value: 'gpt-3.5-turbo-0613'
    },
    {
      label: 'gpt-3.5-turbo-16k-0613',
      value: 'gpt-3.5-turbo-16k-0613'
    },
    {
      label: 'text-davinci-003',
      value: 'text-davinci-003'
    },
    {
      label: 'code-davinci-002',
      value: 'code-davinci-002'
    },
    {
      label: 'gpt-4',
      value: 'gpt-4'
    },
    {
      label: 'gpt-4-0613',
      value: 'gpt-4-0613'
    },
    {
      label: 'gpt-4-32k',
      value: 'gpt-4-32k'
    },
    {
      label: 'gpt-4-32k-0613',
      value: 'gpt-4-32k-0613'
    },
    {
      label: 'gpt-5',
      value: 'gpt-5'
    },
    {
      label: 'gpt-5-mini',
      value: 'gpt-5-mini'
    }
  ]
}

function AikeyPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<
    AikeyInfo & {
      models: Array<string>
    }
  >()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: AikeyInfo | undefined
  }>({
    open: false,
    info: undefined
  })
  const columns: ProColumns<AikeyInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: "3%",
      fixed: 'left'
    },
    {
      title: 'KEY',
      dataIndex: 'key',
      width: "10%",
    },
    {
      title: 'HOST',
      dataIndex: 'host',
      width: "10%",
      render: (_, data) => {
        return (
          <a href={data.host} target="_blank" rel="noreferrer">
            {data.host}
          </a>
        )
      }
    },
    {
      title: 'Available Models',
      dataIndex: 'models',
      width: "10%",
      render: (_, data) => {
        if (!data.models) return '-'
        const modelTag = data.models.split(',').map((model) => {
          return <Tag key={model}>{model}</Tag>
        })
        return <>{modelTag}</>
      }
    },
    {
      title: 'AI Type',
      dataIndex: 'type',
      width: "5%",
      render: (_, data) => <Tag>{data.type}</Tag>
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      width: "8%",
    },
    // {
    //   title: 'Status',
    //   dataIndex: 'status',
    //   width: "10%",
    //   render: (_, data) => (
    //     <Space direction="vertical">
    //       <Tag color={data.status ? 'green' : 'red'}>{data.status ? 'Normal' : 'Abnormal'}</Tag>
    //       <Tag color={data.check ? 'green' : 'red'}>
    //         {data.check ? 'Check Availability' : 'Don\'t Check Availability'}
    //       </Tag>
    //     </Space>
    //   )
    // },
    {
      title: 'Created At',
      dataIndex: 'create_time',
      width: "8%",
      render: (_, data) => {
        return <div>{moment(data.create_time).format('YYYY-MM-DD HH:mm')}</div>
      }
    },
    {
      title: 'Updated At',
      dataIndex: 'update_time',
      width: "8%",
      render: (_, data) => {
        return <div>{moment(data.update_time).format('YYYY-MM-DD HH:mm')}</div>
      }
    },
    {
      title: 'Actions',
      width: "7%",
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
            delAdminAikey({
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

  function getUniqueHosts(arr: Array<AikeyInfo>) {
    const uniqueHosts = new Set<string>()
    uniqueHosts.add('https://api.openai.com')
    uniqueHosts.add('https://openai.api2d.net')
    uniqueHosts.add('https://api.openai-proxy.com')
    uniqueHosts.add('https://api1.openai-proxy.com')
    uniqueHosts.add('https://api2.openai-proxy.com')
    arr.forEach((obj) => uniqueHosts.add(obj.host))
    return Array.from(uniqueHosts).map((host) => ({ label: host, value: host }))
  }
  const [inputHost, setInputHost] = useState<Array<{ label: string; value: string }>>([])
  const [hostOptions, setHostOptions] = useState<Array<{ label: string; value: string }>>([])

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
          const res = await getAdminAikeys({
            page: params.current || 1,
            page_size: params.pageSize || 10
          })

          const hosts = getUniqueHosts(res.data.rows)
          setHostOptions([...hosts])

          return Promise.resolve({
            data: res.data.rows,
            total: res.data.count,
            success: true
          })
        }}
        toolbar={{
          actions: [
            // <Button
            //   key="primary"
            //   type="primary"
            //   size="small"
            //   onClick={() => {
            //     postAdminAikeyCheck({ all: true }).then(() => {
            //       message.success('Refresh submitted successfully, please check later')
            //     })
            //   }}
            // >
            //   Async Refresh Quota
            // </Button>,
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
              Add Aikey
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />
      <ModalForm<
        AikeyInfo & {
          models: Array<string>
        }
      >
        title="Token Information"
        open={edidInfoModal.open}
        form={form}
        initialValues={{
          status: 1,
          type: 'openai',
          check: 0
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
          const models = values.models.join(',')
          if (edidInfoModal.info?.id) {
            const res = await putAdminAikey({
              ...values,
              models,
              id: edidInfoModal.info?.id
            })
            if (res.code) {
              message.error('Edit failed')
              return false
            }
            tableActionRef.current?.reload?.()
          } else {
            const res = await postAdminAikey({
              ...values,
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
        <ProFormGroup size="large">
          <ProFormSegmented
            label="AI Type"
            name="type"
            fieldProps={{
              options: [],
              size: 'large',
              onChange: (value) => {
                if (value === 'stability') {
                  form.setFieldsValue({
                    host: 'https://api.stability.ai',
                    models: []
                  })
                } else {
                  form.setFieldsValue({
                    host: '',
                    models: []
                  })
                }
              }
            }}
            request={async () => [
              {
                label: 'OpenAI',
                value: 'openai'
              },
              {
                label: 'StableDiffusion',
                value: 'stability'
              }
            ]}
            rules={[{ required: true, message: 'AI Type' }]}
          />
          {/* <ProFormRadio.Group
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
          <ProFormRadio.Group
            name="check"
            label="Check Availability"
            radioType="button"
            options={[
              {
                label: 'Don\'t Check',
                value: 0
              },
              {
                label: 'Check',
                value: 1
              }
            ]}
          /> */}
        </ProFormGroup>
        <ProFormDependency name={['type']}>
          {({ type }) => {
            return (
              <ProFormSelect.SearchSelect
                name="host"
                label="API Address or Proxy Address"
                placeholder="Please select or enter API address"
                mode="single"
                disabled={type === 'stability'}
                fieldProps={{
                  labelInValue: false,
                  onSearch: (value) => {
                    if (!value) return
                    setInputHost([{ label: value, value }])
                  },
                  onChange: (value: string) => {
                    if (!value) return
                    setHostOptions((hosts) => {
                      setInputHost([])
                      const is = hosts.filter((item) => item.value === value)
                      if (is.length > 0) return [...hosts]
                      return [{ label: value, value }, ...hosts]
                    })
                  }
                }}
                options={[...inputHost, ...hostOptions]}
                rules={[
                  {
                    required: true,
                    message: 'Please enter correct Host',
                    pattern: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*[^\/]$/i
                  }
                ]}
              />
            )
          }}
        </ProFormDependency>
        <ProFormText
          name="key"
          label="Key"
          placeholder="Key"
          rules={[{ required: true, message: 'Please enter Key' }]}
        />
        <ProFormDependency name={['type']}>
          {({ type }) => {
            return (
              <ProFormSelect
                name="models"
                label="Applicable Models"
                options={getModels(type)}
                fieldProps={{
                  mode: 'multiple'
                }}
                placeholder="Please select AI models available for this Token"
                rules={[
                  {
                    required: true,
                    message: 'Please select AI models available for this Token!'
                  }
                ]}
              />
            )
          }}
        </ProFormDependency>
        <ProFormText name="remarks" label="Remarks" placeholder="Remarks" />
      </ModalForm>
    </div>
  )
}

export default AikeyPage
