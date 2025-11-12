import { getCode } from '@/request/api'
import { userAsync } from '@/store/async'
import { RequestLoginParams } from '@/types'
import {
  HeartFilled,
  LockOutlined,
  UserOutlined,
  RedditCircleFilled,
  SlackCircleFilled,
  TwitterCircleFilled,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons'
import { LoginForm, ProFormCaptcha, ProFormText } from '@ant-design/pro-form'
import { Button, Form, FormInstance, Modal, Space, Tabs, message, Input } from 'antd'
import { useState } from 'react'
import { useNavigation, useLocation } from 'react-router-dom'
import smallLogo from '@/assets/small logo.jpeg'
import styles from './index.module.less'

type Props = {
  open: boolean
  onCancel: () => void
}

type LoginType = 'code' | 'password' | 'register' | string;

export function LoginCard(props: {
  form: FormInstance<RequestLoginParams>
  onSuccess: () => void,
  type?: LoginType
}) {

  const location = useLocation();

  function getQueryParam(key: string) {
    const queryString = location.search || window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(key) || '';
  }

  const { type = 'password' } = props;

  const [loginTabsValue, setLoginTabsValue] = useState<LoginType>('login');
  const [loginType, setLoginType] = useState<LoginType>(type);

  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        {/* Patterned Border Container with concave middle sections */}
        <div className={styles.borderWrapper}>
          <div className={`${styles.borderSegment} ${styles.borderTop}`}></div>
          <div className={`${styles.borderSegment} ${styles.borderBottom}`}></div>
          <div className={`${styles.borderSegment} ${styles.borderLeft}`}></div>
          <div className={`${styles.borderSegment} ${styles.borderRight}`}></div>
        </div>
        
        {/* Glowing effect */}
        <div className={styles.glowEffect}></div>
        
        <h1 className={styles.title}>WELCOME TO ENGAGELINE</h1>
        <Form
          form={props.form}
          className={styles.formContainer}
          onFinish={async (e) => {
            try {
              console.log('[LOGIN] Attempting login with:', { account: e.account, hasPassword: !!e.password, hasCode: !!e.code })

              const res = await userAsync.fetchLogin({ ...e, invite_code: getQueryParam('invite_code') })

              console.log('[LOGIN] Response received:', res)

              if (res.code) {
                // Show error message from API
                const errorMsg = res.message || 'Login failed. Please check your credentials and try again.'
                message.error({
                  content: errorMsg,
                  duration: 5
                })
                throw new Error(errorMsg)
              }

              // Success
              message.success({
                content: 'Login successful!',
                duration: 2
              })
              props.onSuccess?.()
              return Promise.resolve()
            } catch (error: any) {
              console.error('[LOGIN] Error:', error)

              // Handle network errors or other errors
              let errorMsg = 'Network error, please try again later.'

              if (error?.message && !error.message.includes('Network error')) {
                errorMsg = error.message
              } else if (error?.data?.message) {
                errorMsg = error.data.message
              } else if (error?.code === 504) {
                errorMsg = 'Request timeout. Please check if the server is running and try again.'
              } else if (error?.name === 'TypeError' || error?.message?.includes('Failed to fetch')) {
                errorMsg = 'Cannot connect to server. Please make sure the backend server is running on port 3200.'
              }

              // Show error message (the interceptor only shows network errors, not API errors)
              message.error({
                content: errorMsg,
                duration: 5
              })
              throw error
            }
          }}
          layout="vertical"
        >
          <Tabs
            centered
            activeKey={loginTabsValue}
            onChange={(activeKey) => {
              props.form.resetFields()
              const type = activeKey === 'login' ? 'password' : activeKey
              setLoginType(type)
              setLoginTabsValue(activeKey)
            }}
            className={styles.tabsWrapper}
            items={[
              {
                key: 'login',
                label: 'Account Login',
              },
              {
                key: 'register',
                label: 'Register Account',
              },
            ]}
          />

          <Form.Item
            name="account"
            label={<span className={styles.fieldLabel}>Email</span>}
            rules={[
              {
                required: true,
                message: 'Please enter email or phone number'
              }
            ]}
            className={styles.inputWrapper}
          >
            <Input
              size="large"
              placeholder="Email"
            />
          </Form.Item>

          {loginType !== 'password' && (
            <Form.Item
              name="code"
              rules={[
                {
                  required: true,
                  message: 'Please enter verification code!'
                }
              ]}
              className={styles.inputWrapper}
            >
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                  placeholder: 'Verification Code'
                }}
                captchaProps={{
                  size: 'large'
                }}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${'Get Code'}`
                  }
                  return 'Get Code'
                }}
                noStyle
                onGetCaptcha={async () => {
                  const account = props.form.getFieldValue('account')
                  if (!account) {
                    message.error('Please enter email or phone number')
                    throw new Error('Please enter email or phone number')
                  }
                  try {
                    console.log('[FRONTEND] Requesting verification code for:', account)
                    const response = await getCode({ source: account })
                    console.log('[FRONTEND] Response received:', response)

                    if (response.code === 0) {
                      const verificationCode = (response.data as any)?.verification_code || null

                      if (verificationCode) {
                        message.success({
                          content: `Verification code: ${verificationCode}`,
                          duration: 10,
                          style: {
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }
                        })
                        console.log('[FRONTEND] Verification code received:', verificationCode)
                      } else {
                        message.success('Verification code sent! Please check the backend console for the code.')
                      }
                      return Promise.resolve()
                    } else {
                      const errorMsg = response.message || 'Failed to get verification code'
                      message.error(errorMsg)
                      throw new Error(errorMsg)
                    }
                  } catch (error: any) {
                    console.error('[FRONTEND] Error getting verification code:', error)
                    const errorMessage = error?.message || error?.data?.message || 'Failed to get verification code. Please try again.'
                    message.error(errorMessage)
                    throw new Error(errorMessage)
                  }
                }}
              />
            </Form.Item>
          )}

          {loginType !== 'code' && (
            <Form.Item
              name="password"
              label={<span className={styles.fieldLabel}>Password</span>}
              rules={[
                {
                  required: true,
                  message: '8 or more alphanumeric characters',
                  pattern: /^(?:[a-zA-Z]{8,}|\d{8,}|(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z\d]{8,})$/
                },
              ]}
              className={styles.inputWrapper}
            >
              <div className={styles.passwordInputWrapper}>
                <Input
                  size="large"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className={styles.passwordInput}
                />
                <div 
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </div>
              </div>
            </Form.Item>
          )}

          <div className={styles.codeLoginSwitch}>
            {loginTabsValue === 'login' && loginType === 'code' && (
              <Button type="link" onClick={() => {
                props.form.resetFields()
                setLoginType('password')
              }}>
                Password Login
              </Button>
            )}
            {loginTabsValue === 'login' && loginType === 'password' && (
              <Button type="link" onClick={() => {
                props.form.resetFields()
                setLoginType('code')
              }}>
                Code Login
              </Button>
            )}
          </div>

          {loginTabsValue === 'login' && (
            <div className={styles.forgotPassword}>
              <button type="button" className={styles.forgotPasswordLink}>Forgot password?</button>
            </div>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.loginButton}
              block
            >
              {loginType === 'register' ? 'Register & Login' : 'Log in'}
            </Button>
          </Form.Item>
        </Form>

        <div className={styles.termsText}>
          <p>By logging in, you agree to <a href="https://www.baidu.com/">Terms of Use</a> and <a href="https://www.baidu.com/">Privacy Policy</a></p>
        </div>
      </div>
    </div>
  )
}

// Login/Register Modal
function LoginModal(props: Props) {
  const [loginForm] = Form.useForm()

  const onCancel = () => {
    props.onCancel()
    loginForm.resetFields()
  }

  return (
    <Modal
      open={props.open}
      footer={null}
      destroyOnClose
      onCancel={onCancel}
      width="100%"
      className={styles.modalWrapper}
      style={{
        maxWidth: '100vw',
        padding: 0,
        top: 0
      }}
      bodyStyle={{
        padding: 0,
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <LoginCard form={loginForm} onSuccess={onCancel} />
    </Modal>
  )
}

export default LoginModal
