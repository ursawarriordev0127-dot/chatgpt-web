import { userAsync } from '@/store/async'
import { RequestLoginParams } from '@/types'
import { Button, Form, FormInstance, Modal, message, Input, Checkbox } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import LogoImg from '@/assets/logo.jpeg'
import styles from './index.module.less'

type Props = {
  open: boolean
  onCancel: () => void
}

export function LoginCard(props: {
  form: FormInstance<RequestLoginParams>
  onSuccess: () => void
}) {
  const location = useLocation()
  const navigate = useNavigate()

  function getQueryParam(key: string) {
    const queryString = location.search || window.location.search
    const urlParams = new URLSearchParams(queryString)
    return urlParams.get(key) || ''
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginForm}>
          <h1 className={styles.title}><img src={LogoImg} alt="logo" className={styles.logo} /></h1>
          <h2 className="mt-4 text-center text-xl font-bold md:mt-6 md:text-2xl">Case Prep Casey</h2>

          <Form
            form={props.form}
            className={styles.formContainer}
            onFinish={async (e) => {
              try {
                const res = await userAsync.fetchLogin({ ...e, invite_code: getQueryParam('invite_code') })

                if (res.code) {
                  // Error notification is automatically shown by request interceptor
                  // Don't show duplicate message here
                  return
                }

                // Success
                message.success({
                  content: 'Login successful!',
                  duration: 2
                })
                props.onSuccess?.()
              } catch (error: any) {
                console.error('[LOGIN] Error:', error)
                // Error notification is automatically shown by request interceptor
                // Don't show duplicate message here
              }
            }}
            layout="vertical"
          >
            <Form.Item
              name="account"
              required={false}
              label={<span className={styles.fieldLabel}>Email</span>}
              rules={[
                {
                  required: true,
                  message: 'Please enter email'
                }
              ]}
              className={styles.inputWrapper}
            >
              <Input
                size="large"
                placeholder=""
              />
            </Form.Item>

            <Form.Item
              required={false}
              name="password"
              label={<span className={styles.fieldLabel}>Password</span>}
              rules={[
                {
                  required: true,
                  message: 'Please enter password'
                }
              ]}
              className={styles.inputWrapper}
            >
              <Input
                size="large"
                type="password"
                placeholder=""
              />
            </Form.Item>

            <Form.Item className={styles.submitWrapper}>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.loginButton}
                block
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div className={styles.signupPrompt}>
            <span>New to Case Prep Casey? </span>
            <button
              type="button"
              className={styles.signupLink}
              onClick={() => navigate('/signup')}
            >
              Sign up now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Signup Card Component
export function SignupCard(props: {
  form: FormInstance<RequestLoginParams>
  onSuccess: () => void
}) {
  const location = useLocation()
  const navigate = useNavigate()

  function getQueryParam(key: string) {
    const queryString = location.search || window.location.search
    const urlParams = new URLSearchParams(queryString)
    return urlParams.get(key) || ''
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginForm}>
          <h1 className={styles.title}><img src={LogoImg} alt="logo" className={styles.logo} /></h1>
          <h2 className="mt-4 text-center text-xl font-bold md:mt-6 md:text-2xl">Join Case Prep Casey</h2>

          <Form
            form={props.form}
            className={styles.formContainer}
            onFinish={async (e) => {
              try {
                // Using the same login endpoint for registration
                // The backend should handle registration based on whether user exists
                const res = await userAsync.fetchLogin({ ...e, invite_code: getQueryParam('invite_code'), is_signup: true })

                if (res.code) {
                  // Error notification is automatically shown by request interceptor
                  // Don't show duplicate message here
                  return
                }

                message.success({
                  content: 'Account created successfully! Welcome to Case Prep Casey!',
                  duration: 3
                })
                props.onSuccess?.()
              } catch (error: any) {
                console.error('[SIGNUP] Error:', error)
                // Error notification is automatically shown by request interceptor
                // Don't show duplicate message here
              }
            }}
            layout="vertical"
          >
            <Form.Item
              name="account"
              required={false}
              label={<span className={styles.fieldLabel}>Email</span>}
              rules={[
                {
                  required: true,
                  message: 'Please enter email'
                },
                {
                  type: 'email',
                  message: 'Please enter a valid email'
                }
              ]}
              className={styles.inputWrapper}
            >
              <Input
                size="large"
                placeholder=""
              />
            </Form.Item>

            <Form.Item
              required={false}
              name="password"
              label={<span className={styles.fieldLabel}>Password</span>}
              rules={[
                {
                  required: true,
                  message: 'Please enter password'
                },
                {
                  min: 8,
                  message: 'Password must be at least 8 characters'
                }
              ]}
              className={styles.inputWrapper}
            >
              <Input
                size="large"
                type="password"
                placeholder=""
              />
            </Form.Item>

            <Form.Item
              name="agreeToTerms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('You must agree to the terms to continue'))
                }
              ]}
              className={styles.termsWrapper}
            >
              <div className={styles.termsText}>
                <p>I understand that Case Prep Casey is only intended for paying agents in the EngageLine community.</p>
                <p>I understand that if I share my login credentials or allow others to use my account, my access to Case Prep Casey will be immediately terminated.</p>
                <p>Login activity will be monitored.</p>
                <p className={styles.termsAgree}>
                  <Checkbox className={styles.inlineCheckbox}>
                    <strong>I have read and agree to these terms.</strong>
                  </Checkbox>
                </p>
              </div>
            </Form.Item>

            <Form.Item className={styles.submitWrapper}>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.loginButton}
                block
              >
                Sign Up
              </Button>
            </Form.Item>
          </Form>

          <div className={styles.signupPrompt}>
            <span>Already have an account? </span>
            <button
              type="button"
              className={styles.signupLink}
              onClick={() => navigate('/login')}
            >
              Sign in
            </button>
          </div>
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