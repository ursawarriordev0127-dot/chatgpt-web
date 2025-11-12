import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  Form,
  Pagination,
  QRCode,
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message
} from 'antd'
import Layout from '@/components/Layout'
import { getCode, getSigninList, postSignin } from '@/request/api'
import { userAsync } from '@/store/async'
import { configStore, userStore } from '@/store'
import styles from './index.module.less'
import { ConsumeRecordInfo, InvitationRecordInfo, SigninInfo, WithdrawalRecordInfo } from '@/types'
import { formatTime, transform } from '@/utils'
import UserInfoCard from '@/components/UserInfoCard'
import {
  ModalForm,
  ProFormCaptcha,
  ProFormDigit,
  ProFormGroup,
  ProFormRadio,
  ProFormText,
  ProFormTextArea
} from '@ant-design/pro-components'
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { fetchUserPassword, fetchUserRecords, fetchUserWithdrawal } from '@/store/user/async'
import { useNavigate } from 'react-router-dom'
import { ColumnsType } from 'antd/es/table'

const monthAbbreviations = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC'
]

function UserPage() {
  const navigate = useNavigate()
  const { token, user_info, invitation_records, consume_records, withdrawal_records } = userStore()
  const { user_introduce, invite_introduce } = configStore()
  const [userAccountForm] = Form.useForm()
  const [signinLoading, setSigninLoading] = useState(false)
  const [signinList, setSigninList] = useState<Array<SigninInfo>>([])
  const [withdrawalForm] = Form.useForm()

  const [userAccountModal, setUserAccountModal] = useState({
    open: false,
    title: 'Modify Information',
    type: ''
  })

  const [withdrawalInfoModal, setWithdrawalInfoModal] = useState({
    open: false
  })

  const [tableOptions, setTableOptions] = useState<{
    page: number
    page_size: number
    type: number | string
    loading: boolean
  }>({
    page: 1,
    page_size: 10,
    loading: false,
    type: 'invitation_records'
  })

  const invitationRecordColumns: ColumnsType<InvitationRecordInfo> = [
    {
      title: 'Registrant',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (_, data) => {
        return <Tag>{data.user.account}</Tag>
      }
    },
    // {
    //   title: 'Invite Code',
    //   dataIndex: 'invite_code',
    //   key: 'invite_code'
    // },
    {
      title: 'Reward',
      dataIndex: 'reward',
      key: 'reward',
      render: (_, data) => {
        return <a>{data.reward} points</a>
      }
    },
    {
      title: 'Remarks',
      dataIndex: 'remark',
      key: 'remark'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, data) => {
        if (data.status === 3) {
          return <Tag color="orange">Under Review</Tag>
        }
        if (data.status) {
          return <Tag color="green">Issued Successfully</Tag>
        }
        return <Tag color="red">Abnormal Invitation</Tag>
      }
    },
    {
      title: 'Created At',
      dataIndex: 'create_time',
      key: 'create_time'
    }
  ]

  const consumeRecordColumns: ColumnsType<ConsumeRecordInfo> = [
    {
      title: 'Consumer',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (_, data) => {
        return <Tag>{data.user.account}</Tag>
      }
    },
    {
      title: 'Payment Amount',
      dataIndex: 'pay_amount',
      key: 'pay_amount',
      render: (_, data) => {
        return <a>¥{Number(data.pay_amount) / 100}</a>
      }
    },
    {
      title: 'Commission Rate',
      dataIndex: 'commission_rate',
      key: 'commission_rate',
      render: (_, data) => {
        return <a>{data.commission_rate}%</a>
      }
    },
    {
      title: 'Commission Amount',
      dataIndex: 'commission_amount',
      key: 'commission_amount',
      render: (_, data) => {
        return <a>¥{Number(data.commission_amount) / 100}</a>
      }
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, data) => {
        if (data.status === 3) {
          return <Tag color="orange">Under Review</Tag>
        }
        if (data.status) {
          return <Tag color="green">Issued Successfully</Tag>
        }
        return <Tag color="red">Abnormal Consumption</Tag>
      }
    },
    {
      title: 'Created At',
      dataIndex: 'create_time',
      key: 'create_time'
    }
  ]
  const withdrawalRecordColumns: ColumnsType<WithdrawalRecordInfo> = [
    // {
    //   title: 'Name',
    //   dataIndex: 'name',
    //   key: 'name'
    // },
    // {
    //   title: 'Contact',
    //   dataIndex: 'contact',
    //   key: 'contact'
    // },
    {
      title: 'Payment Method',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (_, data) => {
        switch (data.type) {
          case 'wxpay':
            return <Tag>WeChat Pay</Tag>
          case 'qqpay':
            return <Tag>QQ Pay</Tag>
          case 'alipay':
            return <Tag>Alipay</Tag>
          default:
            return '-'
        }
      }
    },
    {
      title: 'Account',
      dataIndex: 'account',
      key: 'account',
      width: 140
    },
    {
      title: 'Withdrawal Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (_, data) => {
        return <Tag>¥{transform.centToYuan(data.amount)}</Tag>
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (_, data) => {
        if (data.status === 3) {
          return <Tag color="orange">Pending Review</Tag>
        }
        if (data.status === 1) {
          return <Tag color="green">Payment Successful</Tag>
        }
        return <Tag color="red">Abnormal Withdrawal</Tag>
      }
    },
    {
      title: 'Remarks/Reply',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 120,
      ellipsis: {
        showTitle: false
      },
      render: (_, data) => <Tooltip title={data.remarks}>{data.remarks}</Tooltip>
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      width: 120,
      ellipsis: {
        showTitle: false
      },
      render: (_, data) => <Tooltip title={data.message}>{data.message}</Tooltip>
    },
    {
      title: 'Created At',
      dataIndex: 'create_time',
      key: 'create_time'
    }
  ]

  const getTableColumns: any = useMemo(() => {
    if (tableOptions.type === 'invitation_records') {
      return [...invitationRecordColumns]
    }

    if (tableOptions.type === 'consume_records') {
      return [...consumeRecordColumns]
    }

    if (tableOptions.type === 'withdrawal_records') {
      return [...withdrawalRecordColumns]
    }
    return []
  }, [tableOptions.type])

  const getTableData: { count: number; rows: Array<any> } = useMemo(() => {
    if (tableOptions.type === 'invitation_records') {
      return { ...invitation_records }
    }

    if (tableOptions.type === 'consume_records') {
      return { ...consume_records }
    }

    if (tableOptions.type === 'withdrawal_records') {
      return { ...withdrawal_records }
    }
    return { count: 0, rows: [] }
  }, [tableOptions.type, withdrawal_records, consume_records, invitation_records])

  function onFetchSigninList() {
    if (!token) return
    getSigninList().then((res) => {
      if (res.code) return
      setSigninList(res.data)
    })
  }

  const monthDays = useMemo(() => {
    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1
    const daysInMonth = new Date(year, month, 0).getDate()
    const dateArray = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      return formatTime('yyyy-MM-dd', new Date(`${year}-${month}-${day}`))
    })
    return dateArray
  }, [])

  const userMonthDays = useMemo(() => {
    const dataList = signinList.map((item) => {
      return formatTime('yyyy-MM-dd', new Date(item.create_time))
    })
    return dataList
  }, [signinList])

  useEffect(() => {
    onUserRecords({ ...tableOptions })
    onFetchSigninList()
  }, [])

  function onUserRecords(params: { page: number; page_size: number; type: string | number }) {
    setTableOptions({
      type: params.type,
      page: params.page,
      page_size: params.page_size,
      loading: true
    })
    fetchUserRecords({
      ...params
    })
      .then((res) => {
        if (res.code) return
        setTableOptions((options) => ({ ...options, loading: false }))
      })
      .finally(() => {
        setTableOptions((options) => ({ ...options, loading: false }))
      })
  }

  return (
    <div className={styles.userPage}>
      <Layout>
        <div className={styles.userPage_container}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* User Info */}
            <UserInfoCard info={user_info}>
              <div className={styles.userPage_operate}>
                {/* <Button block
                                    onClick={() => {
                                        setUserAccountModal({
                                            open: true,
                                            title: 'Modify Account',
                                            type: 'account'
                                        })
                                        userAccountForm.setFieldsValue({
                                            account: user_info?.account
                                        })
                                    }}
                                >
                                    Modify Account
                                </Button> */}
                <Button
                  block
                  type="dashed"
                  danger
                  onClick={() => {
                    setUserAccountModal({
                      open: true,
                      title: 'Reset Password',
                      type: 'password'
                    })
                    userAccountForm.setFieldsValue({
                      account: user_info?.account
                    })
                  }}
                >
                  Reset Password
                </Button>
              </div>
            </UserInfoCard>
            {user_introduce && (
              <div className={styles.userPage_card}>
                <h4>Announcement</h4>
                <div
                  dangerouslySetInnerHTML={{
                    __html: user_introduce
                  }}
                />
              </div>
            )}
            {/* Sign-in Area */}
            <div className={styles.userPage_card}>
              <h4>Sign-in Calendar ({formatTime('yyyy-MM', new Date(monthDays[0]))})</h4>
              <Space direction="vertical">
                <div className={styles.userPage_signin}>
                  {monthDays.map((item) => {
                    const itemClassName = userMonthDays.includes(item)
                      ? `${styles.userPage_signin_item} ${styles.userPage_signin_selectTtem}`
                      : styles.userPage_signin_item
                    return (
                      <div key={item} className={itemClassName}>
                        <p>
                          {formatTime('dd', new Date(item)) === formatTime('dd')
                            ? 'Today'
                            : formatTime('dd', new Date(item))}
                        </p>
                        <p>{monthAbbreviations[Number(formatTime('MM', new Date(item))) - 1]}</p>
                      </div>
                    )
                  })}
                </div>
                <Button
                  loading={signinLoading}
                  type="primary"
                  block
                  disabled={!!user_info?.is_signin}
                  onClick={() => {
                    setSigninLoading(true)
                    postSignin()
                      .then((res) => {
                        if (res.code) return
                        userAsync.fetchUserInfo()
                        onFetchSigninList()
                        message.success(res.message)
                      })
                      .finally(() => {
                        setSigninLoading(false)
                      })
                  }}
                >
                  {user_info?.is_signin ? 'Already Signed In Today' : 'Sign In Now'}
                </Button>
              </Space>
            </div>
            <div className={styles.userPage_card}>
              <h4>Invitation Link/QR Code</h4>
              <div className={styles.userPage_invite}>
                <QRCode
                  size={160}
                  value={`${location.origin}/login?invite_code=${user_info?.invite_code}`}
                  color="#1877ff"
                />
                <div className={styles.userPage_invite_info}>
                  <p className={styles.userPage_invite_info_link}>
                    <Typography.Paragraph copyable style={{ marginBottom: 0, color: '#1877ff' }}>
                      Invitation Link: {`${location.origin}/login?invite_code=${user_info?.invite_code}`}
                    </Typography.Paragraph>
                  </p>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: invite_introduce
                    }}
                  />
                </div>
              </div>
            </div>
            <div className={styles.userPage_card}>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <h4>Invitation Commission Data</h4>
                  <Button
                    size="small"
                    onClick={() => {
                      withdrawalForm.resetFields()
                      setWithdrawalInfoModal({
                        open: true
                      })
                    }}
                  >
                    Apply for Withdrawal
                  </Button>
                </div>
                <div className={styles.userPage_invite_data}>
                  <div>
                    <p>Today's Invitations</p>
                    <span>{user_info?.today_invite_count} people</span>
                  </div>
                  <div>
                    <p>Today's Consumption</p>
                    <span>¥{transform.centToYuan(user_info?.subordinate_today_pay_amount)}</span>
                  </div>
                  <div>
                    <p>Total Earnings</p>
                    <span>¥{transform.centToYuan(user_info?.all_commission_amount)}</span>
                  </div>
                  <div>
                    <p>Balance</p>
                    <span>¥{transform.centToYuan(user_info?.current_amount)}</span>
                  </div>
                </div>
                <Segmented
                  defaultValue={tableOptions.type}
                  value={tableOptions.type}
                  onChange={(e) => {
                    setTableOptions((options) => ({ ...options, page: 1, type: e, loading: true }))
                    onUserRecords({ ...tableOptions, page: 1, type: e })
                  }}
                  block
                  options={[
                    {
                      label: 'Invitation Records',
                      value: 'invitation_records'
                    },
                    {
                      label: 'Consumption Records',
                      value: 'consume_records'
                    },
                    {
                      label: 'Withdrawal Records',
                      value: 'withdrawal_records'
                    }
                  ]}
                />
                <Table
                  scroll={{
                    x: 800
                  }}
                  bordered
                  loading={tableOptions.loading}
                  pagination={false}
                  rowKey="id"
                  dataSource={getTableData.rows}
                  columns={getTableColumns}
                />
                <div style={{ textAlign: 'right' }}>
                  <Pagination
                    size="small"
                    current={tableOptions.page}
                    defaultCurrent={tableOptions.page}
                    defaultPageSize={tableOptions.page_size}
                    total={getTableData.count}
                    onChange={(page: number, pageSize: number) => {
                      onUserRecords({ page, page_size: pageSize, type: tableOptions.type })
                    }}
                    hideOnSinglePage
                  />
                </div>
              </Space>
            </div>
          </Space>
        </div>
      </Layout>

      <ModalForm
        width={500}
        title={userAccountModal.title}
        open={userAccountModal.open}
        form={userAccountForm}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setUserAccountModal((ua) => ({ ...ua, open: false }))
          },
          okText: 'Submit'
        }}
        onFinish={(values) => {
          return fetchUserPassword(values)
            .then((res) => {
              if (res.code) return false
              message.success('Reset successful')
              navigate('/login')
              return true
            })
            .catch(() => {
              return false
            })
        }}
      >
        <ProFormText
          fieldProps={{
            size: 'large',
            prefix: <UserOutlined />
          }}
          name="account"
          disabled
          rules={[
            {
              required: true,
            }
          ]}
        />
        <ProFormCaptcha
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined />
          }}
          captchaProps={{
            size: 'large'
          }}
          placeholder="Verification Code"
          captchaTextRender={(timing, count) => {
            if (timing) {
              return `${count} ${'Get Code'}`
            }
            return 'Get Code'
          }}
          name="code"
          rules={[
            {
              required: true,
              message: 'Please enter verification code!'
            }
          ]}
          onGetCaptcha={async () => {
            const account = userAccountForm.getFieldValue('account')
            return new Promise((resolve, reject) =>
              getCode({ source: account })
                .then(() => resolve())
                .catch(reject)
            )
          }}
        />
        {userAccountModal.type === 'password' && (
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={'prefixIcon'} />
            }}
            placeholder="Please enter password"
            rules={[
              {
                required: true,
                message: '8 or more alphanumeric characters',
                pattern: /^(?:[a-zA-Z]{8,}|\d{8,}|(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z\d]{8,})$/
              }
            ]}
          />
        )}

        {/*
                    {
                        userAccountModal.type === 'account' && (
                            <>
                                <ProFormText
                                    fieldProps={{
                                        size: 'large',
                                        prefix: <MailOutlined />
                                    }}
                                    name="new_account"
                                    placeholder="New Email"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please enter email address',
                                            pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
                                        }
                                    ]}
                                />
                                <ProFormCaptcha
                                    fieldProps={{
                                        size: 'large',
                                        prefix: <LockOutlined />
                                    }}
                                    captchaProps={{
                                        size: 'large'
                                    }}
                                    placeholder="Verification Code"
                                    captchaTextRender={(timing, count) => {
                                        if (timing) {
                                            return `${count} ${'Get Code'}`
                                        }
                                        return 'Get Code'
                                    }}
                                    name="new_code"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please enter verification code!'
                                        }
                                    ]}
                                    onGetCaptcha={async () => {
                                        const new_account = userAccountForm.getFieldValue('new_account')
                                        if (!new_account || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(new_account)) {
                                            userAccountForm.setFields([
                                                {
                                                    name: 'new_account',
                                                    errors: ['Please enter a valid email address']
                                                }
                                            ])
                                            return Promise.reject()
                                        }
                                        return new Promise((resolve, reject) =>
                                            getCode({ source: new_account })
                                                .then(() => resolve())
                                                .catch(reject)
                                        )
                                    }}
                                />
                            </>
                        )
                    }
                */}
      </ModalForm>

      <ModalForm<WithdrawalRecordInfo>
        title="Apply for Withdrawal"
        form={withdrawalForm}
        open={withdrawalInfoModal.open}
        initialValues={{
          status: 1,
          type: 'alipay'
        }}
        onOpenChange={(visible) => {
          setWithdrawalInfoModal({
            open: visible
          })
        }}
        onFinish={async (values) => {
          const res = await fetchUserWithdrawal({
            ...values
          })
          if (res.code) {
            message.error('Withdrawal application failed')
            return false
          }
          withdrawalForm.resetFields()
          message.success('Withdrawal application successful')
		  onUserRecords({
			...tableOptions
		  })
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
            name="name"
            label="Real Name"
            rules={[{ required: true, message: 'Please enter payment account real name' }]}
          />
          <ProFormText
            name="contact"
            label="Contact Information"
            rules={[{ required: true, message: 'Please enter contact information' }]}
          />
          <ProFormText name="account" label="Account Number" rules={[{ required: true }]} />
        </ProFormGroup>
        <ProFormGroup>
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
        </ProFormGroup>
        <ProFormTextArea
          fieldProps={{
            autoSize: {
              minRows: 2,
              maxRows: 2
            }
          }}
          name="message"
          label="Message to Administrator"
        />
      </ModalForm>
    </div>
  )
}

export default UserPage
