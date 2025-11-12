import { Form } from 'antd'
import styles from './index.module.less'
import { useNavigate } from 'react-router-dom'
import { SignupCard } from '@/components/LoginModal'

function SignupPage() {
  const [signupForm] = Form.useForm()
  const navigate = useNavigate()

  return (
    <div className={styles.signup}>
      <SignupCard
        form={signupForm}
        onSuccess={() => {
          signupForm.resetFields()
          navigate('/')
        }}
      />
    </div>
  )
}

export default SignupPage

