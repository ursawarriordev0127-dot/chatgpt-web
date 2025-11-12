import { userAsync } from '@/store/async'
import { RequestLoginParams } from '@/types'
import { Button, Form, FormInstance, Modal, message, Input } from 'antd'
import { useLocation } from 'react-router-dom'
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
          <h2 className="mt-4 text-center text-xl font-bold md:mt-6 md:text-2xl">Log in to your account</h2>

          <Form
            form={props.form}
            className={styles.formContainer}
            onFinish={async (e) => {
              try {
                const res = await userAsync.fetchLogin({ ...e, invite_code: getQueryParam('invite_code') })

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

            <div className={styles.forgotPassword}>
              <button type="button" className={styles.forgotPasswordLink}>Forgot your password?</button>
            </div>
          </Form>
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