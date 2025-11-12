import { ActionType, ProColumns } from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import {
  Tag,
  message,
  Button,
  Modal,
  Radio,
  DatePicker,
  InputNumber,
  Space,
  Spin,
  Input
} from 'antd'
import { useRef, useState } from 'react'
import {
  delAdminCarmi,
  getAdminCarmi,
  addAdminCarmis,
  getAdminCarmiCheck
} from '@/request/adminApi'
import { CarmiInfo } from '@/types/admin'
import { formatTime } from '@/utils'
import styles from './index.module.less'
import FormCard from '../components/FormCard'

function CarmiPage() {
  const tableActionRef = useRef<ActionType>()

  const [generateModal, setGenerateModal] = useState({
    open: false,
    type: 'integral',
    end_time: '',
    quantity: 1,
    reward: 10,
    loading: false,
    level: 1,
    result: ''
  })

  const columns: ProColumns<CarmiInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: 'Activation Code',
      dataIndex: 'key'
    },
    {
      title: 'Reward',
      dataIndex: 'value',
      render: (_, data) => {
        return (
          <a>
            {data.value}
            {data.type === 'integral' ? ' points' : ' days'}
          </a>
        )
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (_, data) => {
        const color = data.status === 1 ? 'red' : data.status === 2 ? 'orange' : 'green'
        return (
          <Tag color={color}>
            {data.status === 1 ? 'Used' : data.status === 2 ? 'Expired' : 'Unused'}
          </Tag>
        )
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
      title: 'Expiry Date',
      dataIndex: 'end_time'
    },
    {
      title: 'User Account',
      dataIndex: 'user_id',
      width: 200,
      render: (_, data) => {
        if (!data.user_id) return '-'
        return <p>{data.user?.account}</p>
      }
    },
    {
      title: 'IP',
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
      width: 100,
      valueType: 'option',
      fixed: 'right',
      render: (_, data) => [
        <Button
          key="del"
          type="text"
          danger
          onClick={() => {
            delAdminCarmi({
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
        params={{}}
        pagination={{}}
        scroll={{
          x: 1800
        }}
        request={async (params, sorter, filter) => {
          const res = await getAdminCarmi({
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
              key="check"
              type="primary"
              size="small"
              onClick={() => {
                getAdminCarmiCheck().then(() => {
                  message.success('Submitted successfully, please check later')
                })
              }}
            >
              Async Check Activation Codes
            </Button>,
            <Button
              key="produce"
              type="primary"
              size="small"
              onClick={() => {
                setGenerateModal((g) => ({ ...g, open: true }))
              }}
            >
              Batch Generate
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />

      <Modal
        title="Activation Code Generation"
        open={generateModal.open}
        footer={null}
        onCancel={() => {
          setGenerateModal({
            open: false,
            type: 'integral',
            end_time: '',
            quantity: 1,
            loading: false,
            reward: 10,
            level: 1,
            result: ''
          })
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space size="large" wrap>
            <FormCard title="Reward Type">
              <Radio.Group
                size="large"
                onChange={(e) => {
                  setGenerateModal((g) => ({ ...g, type: e.target.value }))
                }}
                defaultValue={generateModal.type}
                value={generateModal.type}
              >
                <Radio.Button value="integral">Points</Radio.Button>
                <Radio.Button value="day">Duration (Days)</Radio.Button>
              </Radio.Group>
            </FormCard>
            <FormCard title="Reward Amount">
              <InputNumber
                size="large"
                min={1}
                max={99999}
                onChange={(e) => {
                  if (e) {
                    setGenerateModal((g) => ({ ...g, reward: e }))
                  }
                }}
                value={generateModal.reward}
              />
            </FormCard>
            <FormCard title="Expiry Date">
              <DatePicker
                size="large"
                format="YYYY-MM-DD"
                disabledDate={(current) => {
                  const date = new Date()
                  date.setHours(0, 0, 0, 0)
                  return current && current.toDate().getTime() < date.getTime()
                }}
                onChange={(e) => {
                  if (e) {
                    const dateString = formatTime('yyyy-MM-dd', e?.toDate())
                    setGenerateModal((g) => ({ ...g, end_time: dateString }))
                  } else {
                    setGenerateModal((g) => ({ ...g, end_time: '' }))
                  }
                }}
              />
            </FormCard>
          </Space>
          <Space size="large">
            <FormCard title="Activation Code Member Level">
              <Radio.Group
                size="large"
                onChange={(e) => {
                  setGenerateModal((g) => ({ ...g, level: e.target.value }))
                }}
                defaultValue={generateModal.level}
                value={generateModal.level}
              >
                <Radio.Button value={1}>Regular Member</Radio.Button>
                <Radio.Button value={2}>Super Member</Radio.Button>
              </Radio.Group>
            </FormCard>
            <FormCard title="Generation Quantity">
              <InputNumber
                style={{ width: '100%' }}
                size="large"
                min={1}
                max={50}
                onChange={(e) => {
                  if (e) {
                    setGenerateModal((g) => ({ ...g, quantity: e }))
                  }
                }}
                value={generateModal.quantity}
              />
            </FormCard>
          </Space>
          <div
            className={styles.generate}
            style={{
              height: generateModal.result || generateModal.loading ? 120 : 0
            }}
          >
            {generateModal.result && !generateModal.loading && (
              <Input.TextArea
                value={generateModal.result}
                disabled
                placeholder="Controlled autosize"
                autoSize={{
                  minRows: 5,
                  maxRows: 5
                }}
              />
            )}
            {generateModal.loading && <Spin />}
          </div>

          <Button
            loading={generateModal.loading}
            onClick={() => {
              setGenerateModal((g) => ({ ...g, loading: true }))
              addAdminCarmis({
                type: generateModal.type,
                end_time: generateModal.end_time,
                quantity: generateModal.quantity,
                reward: generateModal.reward,
                level: generateModal.level
              })
                .then((res) => {
                  if (res.code) return
                  const keys = res.data.map((info) => `${info.key}`).join('\n')
                  setGenerateModal((g) => ({ ...g, loading: false, result: keys }))
                  tableActionRef.current?.reloadAndRest?.()
                })
                .finally(() => {
                  setGenerateModal((g) => ({ ...g, loading: false }))
                })
            }}
            type="primary"
            block
            size="large"
          >
            Generate Now
          </Button>
        </Space>
      </Modal>
    </div>
  )
}

export default CarmiPage
