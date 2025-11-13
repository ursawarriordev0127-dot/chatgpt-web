import { adminAsync } from '@/store/async'
import { RequestLoginParams } from '@/types'
import { Button, Form, FormInstance, message, Input } from 'antd'
import { useNavigate } from 'react-router-dom'
import LogoImg from '@/assets/logo.jpeg'
import styles from './index.module.less'

export function AdminLoginCard(props: {
  form: FormInstance<RequestLoginParams>
  onSuccess: () => void
}) {
  const navigate = useNavigate()

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginForm}>
          <h1 className={styles.title}><img src={LogoImg} alt="logo" className={styles.logo} /></h1>
          <h2 className="mt-4 text-center text-xl font-bold md:mt-6 md:text-2xl">Admin Login</h2>
          <p className={styles.adminNotice}>Administrator Access Only</p>

          <Form
            form={props.form}
            className={styles.formContainer}
            onFinish={async (e) => {
              try {
                const res = await adminAsync.fetchAdminLogin({ ...e })

                if (res.code === 403) {
                  message.error({
                    content: 'Access denied. Admin privileges required.',
                    duration: 3
                  })
                  return
                }

                if (res.code) {
                  // Error notification is automatically shown by request interceptor
                  return
                }

                // Success
                message.success({
                  content: 'Admin login successful!',
                  duration: 2
                })
                props.onSuccess?.()
              } catch (error: any) {
                console.error('[ADMIN LOGIN] Error:', error)
                message.error({
                  content: error.message || 'Admin login failed',
                  duration: 3
                })
              }
            }}
            layout="vertical"
          >
            <Form.Item
              name="account"
              required={false}
              label={<span className={styles.fieldLabel}>Admin Email</span>}
              rules={[
                {
                  required: true,
                  message: 'Please enter admin email'
                }
              ]}
              className={styles.inputWrapper}
            >
              <Input
                size="large"
                placeholder="admin@example.com"
              />
            </Form.Item>

            <Form.Item
              required={false}
              name="password"
              label={<span className={styles.fieldLabel}>Admin Password</span>}
              rules={[
                {
                  required: true,
                  message: 'Please enter admin password'
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
                Sign In as Admin
              </Button>
            </Form.Item>
          </Form>

          <div className={styles.signupPrompt}>
            <span>Regular user? </span>
            <button
              type="button"
              className={styles.signupLink}
              onClick={() => navigate('/login')}
            >
              Go to user login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginCard
