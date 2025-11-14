import {
  getAdminAikeys,
  delAdminAikey,
  putAdminAikey,
  postAdminAikey,
  postAdminAikeyCheck,
  fetchAikeyModels
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
import { Button, Form, Progress, Space, Tag, message, Spin, Row, Col } from 'antd'
import { useRef, useState, useEffect } from 'react'
import moment from 'moment'
import { CopyOutlined } from '@ant-design/icons'
import useMobile from '@/hooks/useMobile'

function AikeyPage() {
  const isMobile = useMobile()
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920)
  const tableActionRef = useRef<ActionType>()
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
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
      width: isMobile ? 60 : '3%',
      fixed: isMobile ? 'left' : undefined,
      hideInTable: windowWidth < 576,
      ellipsis: true
    },
    {
      title: 'KEY',
      dataIndex: 'key',
      width: isMobile ? 150 : '10%',
      ellipsis: true,
      render: (text) => {
        const keyValue = String(text || '')
        const handleCopy = async () => {
          try {
            await navigator.clipboard.writeText(keyValue)
            message.success('Copied to clipboard')
          } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = keyValue
            textArea.style.position = 'fixed'
            textArea.style.opacity = '0'
            document.body.appendChild(textArea)
            textArea.select()
            try {
              document.execCommand('copy')
              message.success('Copied to clipboard')
            } catch (err) {
              message.error('Failed to copy')
            }
            document.body.removeChild(textArea)
          }
        }
        return (
          <Row justify="space-around" gutter={[8, 0]}>
            <Col span={isMobile ? 18 : 20} style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {text}
            </Col>
            <Col span={isMobile ? 6 : 3}>
              <CopyOutlined 
                onClick={handleCopy}
                style={{ cursor: 'pointer', color: '#1890ff', fontSize: isMobile ? 16 : 14 }}
                title="Copy to clipboard"
              />
            </Col>
          </Row>
        )
      }
    },
    {
      title: 'HOST',
      dataIndex: 'host',
      width: isMobile ? 120 : '10%',
      ellipsis: true,
      hideInTable: windowWidth < 768,
      render: (_, data) => {
        return (
          <a href={data.host} target="_blank" rel="noreferrer" style={{ fontSize: isMobile ? 12 : 14 }}>
            {data.host}
          </a>
        )
      }
    },
    {
      title: 'Available Models',
      dataIndex: 'models',
      width: isMobile ? 100 : '10%',
      hideInTable: windowWidth < 992,
      render: (_, data) => {
        if (!data.models) return '-'
        const models = data.models.split(',')
        const displayModels = isMobile ? models.slice(0, 2) : models
        const modelTag = displayModels.map((model) => {
          return <Tag key={model} style={{ fontSize: isMobile ? 11 : 12, margin: '2px' }}>{model}</Tag>
        })
        return <>{modelTag}{models.length > 2 && isMobile && <Tag>+{models.length - 2}</Tag>}</>
      }
    },
    {
      title: 'AI Type',
      dataIndex: 'type',
      width: isMobile ? 80 : '5%',
      render: (_, data) => <Tag style={{ fontSize: isMobile ? 11 : 12 }}>{data.type}</Tag>
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      width: isMobile ? 100 : '8%',
      ellipsis: true,
      hideInTable: windowWidth < 768
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
      width: isMobile ? 120 : '8%',
      hideInTable: windowWidth < 992,
      render: (_, data) => {
        return (
<div style={{ fontSize: isMobile ? 11 : 14 }}>
          {isMobile ? moment(data.create_time).format('MM-DD HH:mm') : moment(data.create_time).format('YYYY-MM-DD HH:mm')}
</div>
)
      }
    },
    {
      title: 'Updated At',
      dataIndex: 'update_time',
      width: isMobile ? 120 : '8%',
      hideInTable: windowWidth < 1200,
      render: (_, data) => {
        return (
<div style={{ fontSize: isMobile ? 11 : 14 }}>
          {isMobile ? moment(data.update_time).format('MM-DD HH:mm') : moment(data.update_time).format('YYYY-MM-DD HH:mm')}
</div>
)
      }
    },
    {
      title: 'Actions',
      width: isMobile ? 100 : '7%',
      valueType: 'option',
      fixed: isMobile ? 'right' : undefined,
      render: (_, data) => [
        <Button
          key="edit"
          type="link"
          size={isMobile ? 'small' : 'middle'}
          style={{ padding: isMobile ? '4px 8px' : undefined }}
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
          size={isMobile ? 'small' : 'middle'}
          style={{ padding: isMobile ? '4px 8px' : undefined }}
          onClick={async () => {
            try {
              const res = await delAdminAikey({
                id: data.id
              })
              if (res.code) {
                message.error(res.message || 'Delete failed')
                return
              }
              message.success('Deleted successfully')
              tableActionRef.current?.reload()
            } catch (error: any) {
              message.error(error.message || 'Delete failed')
            }
          }}
        >
          {isMobile ? 'Del' : 'Delete'}
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
  const [availableModels, setAvailableModels] = useState<Array<{ label: string; value: string }>>([])
  const [fetchingModels, setFetchingModels] = useState(false)

  return (
    <div>
      <ProTable
        actionRef={tableActionRef}
        columns={columns}
        scroll={{
          x: isMobile ? 800 : 1400
        }}
        size={isMobile ? 'small' : 'middle'}
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
            setAvailableModels([]) // Clear fetched models when modal closes
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
              message.error(res.message || 'Edit failed')
              return false
            }
            message.success('Updated successfully')
            tableActionRef.current?.reload?.()
          } else {
            const res = await postAdminAikey({
              ...values,
              models
            })
            if (res.code) {
              message.error(res.message || 'Add failed')
              return false
            }
            message.success('Created successfully')
            tableActionRef.current?.reloadAndRest?.()
          }
          return true
        }}
        size={isMobile ? 'small' : 'large'}
        modalProps={{
          cancelText: 'Cancel',
          okText: 'Submit',
          width: isMobile ? '95%' : undefined,
          style: isMobile ? { top: 20 } : undefined
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
        <ProFormDependency name={['type', 'key', 'host']}>
          {({ type, key, host }) => {
            const handleFetchModels = async () => {
              if (!key || !host) {
                message.warning('Please enter both Key and Host first')
                return
              }
              
              setFetchingModels(true)
              try {
                const res = await fetchAikeyModels({ key, host })
                if (res.code) {
                  message.error(res.message || 'Failed to fetch models')
                  return
                }
                
                const models = res.data || []
                if (models.length === 0) {
                  message.warning('No models found for this API key')
                  return
                }
                
                setAvailableModels(models)
                // Auto-select all fetched models only if no models are currently selected
                const currentModels = form.getFieldValue('models') || []
                if (currentModels.length === 0) {
                  form.setFieldsValue({ models: models.map(m => m.value) })
                }
                message.success(`Found ${models.length} available model(s)`)
              } catch (error: any) {
                message.error(error.message || 'Failed to fetch models')
              } finally {
                setFetchingModels(false)
              }
            }
            
            // Use fetched models if available, otherwise use default models
            const modelOptions = availableModels.length > 0 
              ? availableModels 
              : []
            
            return (
              <div>
                <ProFormSelect
                  name="models"
                  label="Applicable Models"
                  options={modelOptions}
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
                  extra={
                    type === 'openai' && key && host ? (
                      <Button
                        type="link"
                        size="small"
                        onClick={handleFetchModels}
                        loading={fetchingModels}
                        style={{ padding: 0, marginTop: 4 }}
                      >
                        {fetchingModels ? 'Fetching models...' : '🔍 Fetch available models from API'}
                      </Button>
                    ) : null
                  }
                />
              </div>
            )
          }}
        </ProFormDependency>
        <ProFormText name="remarks" label="Remarks" placeholder="Remarks" />
      </ModalForm>
    </div>
  )
}

export default AikeyPage
