import { Form, message } from 'antd'
import styles from './index.module.less'
import { useNavigate } from 'react-router-dom'
import { AdminLoginCard } from '@/components/AdminLoginModal'

function AdminLoginPage() {
  const [loginForm] = Form.useForm()
  const navigate = useNavigate()

  return (
    <div className={styles.adminLogin}>
      <AdminLoginCard
        form={loginForm}
        onSuccess={() => {
          loginForm.resetFields()
          navigate('/admin')
        }}
      />
    </div>
  )
}

export default AdminLoginPage
